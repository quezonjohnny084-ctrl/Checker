import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('control');
  const [combos, setCombos] = useState('');
  const [threads, setThreads] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    processed: 0, total: 0, valid: 0, invalid: 0, 
    clean: 0, notClean: 0, hasCodm: 0, noCodm: 0,
    rate: 0, eta: '--', elapsed: '0s'
  });
  const [results, setResults] = useState([]);
  const [consoleLines, setConsoleLines] = useState([]);
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCombos(e.target.result);
        const count = e.target.result.split('\n').filter(l => l.includes(':')).length;
        toast.success(`${count} combos loaded`);
      };
      reader.readAsText(file);
    }
  };

  const startCheck = async () => {
    if (!combos.trim()) {
      toast.error('Please enter or upload combos');
      return;
    }

    const comboList = combos.split('\n').filter(l => l.includes(':')).map(l => l.trim());

    try {
      setIsRunning(true);
      const token = localStorage.getItem('zia_token');
      const res = await axios.post(`${API_URL}/check/start`, {
        combos: comboList,
        threads: threads
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Check started!');

      // Poll for status
      const checkId = res.data.check_id;
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_URL}/check/status/${checkId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = statusRes.data;

          setProgress((data.processed / data.total) * 100);
          setStats({
            processed: data.processed,
            total: data.total,
            valid: data.valid,
            invalid: data.invalid,
            clean: data.clean || 0,
            notClean: data.notClean || 0,
            hasCodm: data.hasCodm || 0,
            noCodm: data.noCodm || 0,
            rate: data.rate || 0,
            eta: data.eta || '--',
            elapsed: data.elapsed || '0s'
          });

          if (data.status === 'completed' || data.status === 'stopped') {
            clearInterval(interval);
            setIsRunning(false);
            toast.success('Check completed!');
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);

    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start check');
      setIsRunning(false);
    }
  };

  const stopCheck = async () => {
    // Implementation for stopping
    setIsRunning(false);
    toast.info('Check stopped');
  };

  const downloadResults = () => {
    toast.success('Downloading results...');
    // Implementation for downloading
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300">
      {/* Header */}
      <header className="bg-[#12121a]/80 backdrop-blur-xl border-b border-purple-500/10 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-wider">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">ZIA</span>
              <span className="text-white">CODM</span>
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${isRunning ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
              {isRunning ? 'RUNNING' : 'IDLE'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-gray-500">
              <i className="fas fa-user mr-1"></i> @{user?.username}
            </span>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#12121a]/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex gap-1">
          {['control', 'console', 'results', 'stats'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <i className={`fas fa-${tab === 'control' ? 'th-large' : tab === 'console' ? 'terminal' : tab === 'results' ? 'file-alt' : 'chart-bar'}`}></i>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'control' && (
          <div className="space-y-4">
            {/* Combo Input */}
            <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <i className="fas fa-list text-purple-400"></i> Combo List
                </h3>
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors cursor-pointer">
                    <i className="fas fa-upload mr-1"></i> Upload .txt
                    <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                  </label>
                  <button onClick={() => setCombos('')} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-semibold hover:bg-red-900/30 hover:text-red-400 transition-colors">
                    <i className="fas fa-trash mr-1"></i> Clear
                  </button>
                </div>
              </div>
              <textarea
                value={combos}
                onChange={(e) => setCombos(e.target.value)}
                rows={6}
                placeholder="email:password&#10;user:pass123&#10;..."
                className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{combos.split('\n').filter(l => l.includes(':')).length} combos</span>
                <span>Format: email:password (one per line)</span>
              </div>
            </div>

            {/* Threads & Run */}
            <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Concurrent Threads</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={threads}
                      onChange={(e) => setThreads(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="w-16 bg-[#0a0a0f] border border-gray-800 rounded-lg px-3 py-2 text-center font-mono font-bold text-purple-400">
                      {threads}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {!isRunning ? (
                    <button onClick={startCheck} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                      <i className="fas fa-play"></i> START
                    </button>
                  ) : (
                    <button onClick={stopCheck} className="px-8 py-3 bg-gray-800 border border-red-900/50 text-red-400 font-bold rounded-lg hover:bg-red-900/20 transition-all flex items-center gap-2">
                      <i className="fas fa-stop"></i> STOP
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span className="text-white font-bold">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Processed</div>
                  <div className="text-xl font-bold text-white font-mono">{stats.processed}/{stats.total}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Rate</div>
                  <div className="text-xl font-bold text-cyan-400 font-mono">{stats.rate}/s</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">ETA</div>
                  <div className="text-xl font-bold text-yellow-400 font-mono">{stats.eta}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Elapsed</div>
                  <div className="text-xl font-bold text-gray-300 font-mono">{stats.elapsed}</div>
                </div>
              </div>
            </div>

            {/* Download */}
            <button 
              onClick={downloadResults}
              disabled={!results.length}
              className="w-full py-3 bg-gray-800 border border-yellow-500/30 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-download"></i> Download Results
            </button>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <i className="fas fa-terminal text-cyan-400"></i> Live Console
              </h3>
              <button onClick={() => setConsoleLines([])} className="px-3 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700">
                <i className="fas fa-times mr-1"></i> Clear
              </button>
            </div>
            <div ref={consoleRef} className="bg-[#0a0a0f] rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs space-y-1">
              {consoleLines.length === 0 ? (
                <div className="text-gray-600">Waiting for check to start...</div>
              ) : (
                consoleLines.map((line, i) => (
                  <div key={i} className={line.type === 'valid' ? 'text-green-400' : line.type === 'invalid' ? 'text-red-400' : line.type === 'hit' ? 'text-yellow-400' : 'text-gray-400'}>
                    {line.text}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <i className="fas fa-trophy text-yellow-400"></i> Results
              </h3>
              <div className="flex gap-3 text-sm">
                <span><span className="text-green-400 font-bold">{stats.valid}</span> hits</span>
                <span className="text-gray-600">·</span>
                <span><span className="text-green-400 font-bold">{stats.clean}</span> clean</span>
                <span className="text-gray-600">·</span>
                <span><span className="text-purple-400 font-bold">{stats.hasCodm}</span> CODM</span>
              </div>
            </div>
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="text-center text-gray-600 py-8">No results yet. Start a check to see hits here.</div>
              ) : (
                results.map((hit, i) => (
                  <div key={i} className={`bg-[#0a0a0f] rounded-lg p-4 border-l-2 ${hit.isClean ? 'border-green-500' : 'border-yellow-500'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-purple-400 text-sm">{hit.account}</h4>
                      <div className="flex gap-1">
                        {hit.isClean && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold">CLEAN</span>}
                        {hit.hasCodm && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">CODM</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Level</span><span className="text-white">{hit.level || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">IGN</span><span className="text-white">{hit.ign || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Region</span><span className="text-white">{hit.region || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Shell</span><span className="text-yellow-400">{hit.shell || 0}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-cyan-400"></i> Live Stats
            </h3>

            {/* Login Stats */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Login</h4>
              <div className="space-y-3">
                {[
                  { label: 'Valid', value: stats.valid, color: 'green' },
                  { label: 'Invalid', value: stats.invalid, color: 'red' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{s.label}</span>
                      <span className={`text-${s.color}-400 font-bold font-mono`}>{s.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-${s.color}-500 rounded-full`} style={{ width: `${stats.total ? (s.value / stats.total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quality</h4>
              <div className="space-y-3">
                {[
                  { label: 'Clean', value: stats.clean, color: 'green' },
                  { label: 'Not Clean', value: stats.notClean, color: 'yellow' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{s.label}</span>
                      <span className={`text-${s.color}-400 font-bold font-mono`}>{s.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-${s.color}-500 rounded-full`} style={{ width: `${stats.valid ? (s.value / stats.valid) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
