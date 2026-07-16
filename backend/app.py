from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import jwt
import datetime
import hashlib
import secrets
import threading
import json
import os
from functools import wraps
from pathlib import Path

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = secrets.token_hex(32)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# ─── CONFIG ─────────────────────────────────────
ADMIN_SECRET_KEY = "ZIA_ADMIN_2026"  # Change this!
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
TELEGRAM_BOT_USERNAME = "ZIA_CODM_Bot"

# ─── DATA STORAGE ───────────────────────────────
USERS_FILE = Path("data/users.json")
TOKENS_FILE = Path("data/tokens.json")
CHECKS_FILE = Path("data/checks.json")
RESULTS_DIR = Path("data/results")

for d in [USERS_FILE.parent, RESULTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── HELPERS ────────────────────────────────────
def load_json(path, default=None):
    if path.exists():
        with open(path, 'r') as f:
            return json.load(f)
    return default or {}

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def generate_token(username, duration_days=30):
    """Generate JWT access token for user"""
    payload = {
        'username': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=duration_days),
        'iat': datetime.datetime.utcnow(),
        'jti': secrets.token_hex(16)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            token = token.split(" ")[1]  # Bearer <token>
        except IndexError:
            return jsonify({'error': 'Invalid token format'}), 401

        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(payload, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        admin_key = request.headers.get('X-Admin-Key')
        if admin_key != ADMIN_SECRET_KEY:
            return jsonify({'error': 'Admin access denied'}), 403
        return f(*args, **kwargs)
    return decorated

# ─── AUTH ROUTES ────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register via Telegram token"""
    data = request.json
    tg_username = data.get('username')
    tg_id = data.get('telegram_id')

    users = load_json(USERS_FILE, {})

    if tg_username in users:
        return jsonify({'error': 'User already exists'}), 400

    # Generate access token (30 days default)
    access_token = generate_token(tg_username, 30)

    users[tg_username] = {
        'telegram_id': tg_id,
        'username': tg_username,
        'created_at': datetime.datetime.utcnow().isoformat(),
        'expires_at': (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat(),
        'checks_today': 0,
        'total_checks': 0,
        'active': True,
        'token': access_token
    }

    save_json(USERS_FILE, users)

    return jsonify({
        'message': 'Registration successful',
        'token': access_token,
        'expires': users[tg_username]['expires_at']
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login with access token"""
    data = request.json
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Token required'}), 400

    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    users = load_json(USERS_FILE, {})
    username = payload['username']

    if username not in users or not users[username].get('active', True):
        return jsonify({'error': 'Account inactive or not found'}), 403

    # Refresh token if expiring soon
    exp = datetime.datetime.fromtimestamp(payload['exp'])
    if (exp - datetime.datetime.utcnow()).days < 3:
        new_token = generate_token(username, 30)
        users[username]['token'] = new_token
        users[username]['expires_at'] = (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat()
        save_json(USERS_FILE, users)
        return jsonify({
            'message': 'Login successful (token refreshed)',
            'token': new_token,
            'user': users[username]
        })

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': users[username]
    })

@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify(current_user):
    """Verify token validity"""
    users = load_json(USERS_FILE, {})
    return jsonify({
        'valid': True,
        'user': users.get(current_user['username'], {})
    })

# ─── ADMIN ROUTES ───────────────────────────────
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users (admin only)"""
    users = load_json(USERS_FILE, {})
    return jsonify({'users': users})

@app.route('/api/admin/generate-key', methods=['POST'])
@admin_required
def generate_access_key():
    """Generate new access key for user"""
    data = request.json
    username = data.get('username')
    duration = data.get('duration_days', 30)

    token = generate_token(username, duration)

    # Store token
    tokens = load_json(TOKENS_FILE, {})
    tokens[token] = {
        'username': username,
        'created_at': datetime.datetime.utcnow().isoformat(),
        'expires_at': (datetime.datetime.utcnow() + datetime.timedelta(days=duration)).isoformat(),
        'active': True
    }
    save_json(TOKENS_FILE, tokens)

    return jsonify({
        'token': token,
        'username': username,
        'expires': tokens[token]['expires_at']
    })

@app.route('/api/admin/user/<username>/toggle', methods=['POST'])
@admin_required
def toggle_user(username):
    """Enable/disable user"""
    users = load_json(USERS_FILE, {})
    if username not in users:
        return jsonify({'error': 'User not found'}), 404

    users[username]['active'] = not users[username].get('active', True)
    save_json(USERS_FILE, users)

    return jsonify({
        'message': f"User {username} {'activated' if users[username]['active'] else 'deactivated'}"
    })

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    """Get admin dashboard stats"""
    users = load_json(USERS_FILE, {})
    checks = load_json(CHECKS_FILE, {})

    total_users = len(users)
    active_users = sum(1 for u in users.values() if u.get('active', True))
    total_checks = sum(u.get('total_checks', 0) for u in users.values())

    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'total_checks': total_checks,
        'checks_today': sum(1 for c in checks.values() if c.get('date') == datetime.date.today().isoformat()),
        'server_status': 'online',
        'version': '2.0.0'
    })

# ─── CHECKER ROUTES ────────────────────────────
@app.route('/api/check/start', methods=['POST'])
@token_required
@limiter.limit("10 per minute")
def start_check(current_user):
    """Start a new checking session"""
    data = request.json
    combos = data.get('combos', [])
    threads = min(data.get('threads', 5), 50)  # Max 50 threads

    if not combos:
        return jsonify({'error': 'No combos provided'}), 400

    # Update user stats
    users = load_json(USERS_FILE, {})
    username = current_user['username']
    users[username]['total_checks'] = users[username].get('total_checks', 0) + len(combos)
    users[username]['checks_today'] = users[username].get('checks_today', 0) + len(combos)
    save_json(USERS_FILE, users)

    # Create check session
    check_id = secrets.token_hex(8)
    checks = load_json(CHECKS_FILE, {})
    checks[check_id] = {
        'username': username,
        'started_at': datetime.datetime.utcnow().isoformat(),
        'total': len(combos),
        'processed': 0,
        'valid': 0,
        'invalid': 0,
        'errors': 0,
        'status': 'running',
        'results': []
    }
    save_json(CHECKS_FILE, checks)

    # Start background checking (integrate your Python checker here)
    threading.Thread(target=run_checker, args=(check_id, combos, threads), daemon=True).start()

    return jsonify({
        'check_id': check_id,
        'message': 'Check started',
        'total': len(combos)
    })

def run_checker(check_id, combos, threads):
    """Background checker - integrate your upd.py logic here"""
    checks = load_json(CHECKS_FILE, {})

    # TODO: Integrate your actual checking logic from upd.py
    # This is a placeholder that simulates checking
    for i, combo in enumerate(combos):
        # Simulate processing
        import time
        time.sleep(0.1)

        checks[check_id]['processed'] = i + 1

        # Simulate random results
        import random
        result = random.choice(['valid', 'invalid', 'error'])
        if result == 'valid':
            checks[check_id]['valid'] += 1
        elif result == 'invalid':
            checks[check_id]['invalid'] += 1
        else:
            checks[check_id]['errors'] += 1

        checks[check_id]['results'].append({
            'combo': combo,
            'status': result,
            'timestamp': datetime.datetime.utcnow().isoformat()
        })

        save_json(CHECKS_FILE, checks)

    checks[check_id]['status'] = 'completed'
    checks[check_id]['completed_at'] = datetime.datetime.utcnow().isoformat()
    save_json(CHECKS_FILE, checks)

@app.route('/api/check/status/<check_id>', methods=['GET'])
@token_required
def check_status(current_user, check_id):
    """Get check session status"""
    checks = load_json(CHECKS_FILE, {})
    if check_id not in checks:
        return jsonify({'error': 'Check not found'}), 404

    return jsonify(checks[check_id])

@app.route('/api/check/stop/<check_id>', methods=['POST'])
@token_required
def stop_check(current_user, check_id):
    """Stop a running check"""
    checks = load_json(CHECKS_FILE, {})
    if check_id not in checks:
        return jsonify({'error': 'Check not found'}), 404

    checks[check_id]['status'] = 'stopped'
    save_json(CHECKS_FILE, checks)

    return jsonify({'message': 'Check stopped'})

@app.route('/api/check/download/<check_id>', methods=['GET'])
@token_required
def download_results(current_user, check_id):
    """Download check results as ZIP"""
    # TODO: Generate and return ZIP file
    return jsonify({'message': 'Download endpoint - integrate ZIP generation'})

# ─── TELEGRAM WEBHOOK ──────────────────────────
@app.route('/api/telegram/webhook', methods=['POST'])
def telegram_webhook():
    """Handle Telegram bot webhooks"""
    data = request.json

    if 'message' in data:
        message = data['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')

        if text == '/start':
            # Send welcome message with keyboard
            return jsonify({
                'method': 'sendMessage',
                'chat_id': chat_id,
                'text': '👋 Welcome to ZIA CODM Bot!\n\n📊 Use /token to get your access key\n📁 Use /check to check accounts\n📈 Use /stats to view your stats',
                'parse_mode': 'Markdown'
            })

        elif text == '/token':
            # Generate and send token
            username = message['from'].get('username', f"user_{chat_id}")
            token = generate_token(username, 30)

            return jsonify({
                'method': 'sendMessage',
                'chat_id': chat_id,
                'text': f'🔑 Your Access Token:\n\n`{token}`\n\n⚠️ Valid for 30 days\n🌐 Use it at: https://your-domain.com',
                'parse_mode': 'Markdown'
            })

    return jsonify({'ok': True})

# ─── HEALTH CHECK ──────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.datetime.utcnow().isoformat()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
