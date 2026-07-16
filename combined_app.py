from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# Import your existing backend
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from app import app as backend_app

# Serve frontend static files
@backend_app.route('/', defaults={'path': ''})
@backend_app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('frontend/build', path)):
        return send_from_directory('frontend/build', path)
    else:
        return send_from_directory('frontend/build', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    backend_app.run(host='0.0.0.0', port=port)
