import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, active_users: 0, total_checks: 0 });
  const [newUser, setNewUser] = useState({ username: '', duration: 30 });
  const [generatedToken, setGeneratedToken] = useState('');

  useEffect(() => {
    // Fetch admin data
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    // API call to get users
    setUsers([
      { username: '@johndoe', token: 'zia_abc123', active: true, checks: 1240, expires: '2026-08-16' },
      { username: '@alicesmith', token: 'zia_xyz789', active: true, checks: 856, expires: '2026-07-18' },
    ]);
  };

  const fetchStats = async () => {
    setStats({ total_users: 142, active_users: 89, total_checks: 12450, revenue: 847 });
  };

  const generateKey = () => {
    if (!newUser.username) {
      toast.error('Enter a username');
      return;
    }
    const token = 'zia_' + Math.random().toString(36).substring(2, 15);
    setGeneratedToken(token);
    toast.success('Token generated!');
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-wider">
              <span className="text-red-500">ADMIN</span>
              <span className="text-white">PANEL</span>
            </h1>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold border border-red-500/30">SUPERUSER</span>
          </div>
          <a href="/dashboard" className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <i className="fas fa-arrow-left"></i> Back
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.total_users, color: 'white' },
            { label: 'Active Today', value: stats.active_users, color: 'green' },
            { label: 'Total Checks', value: stats.total_checks, color: 'purple' },
            { label: 'Revenue', value: `$${stats.revenue}`, color: 'yellow' },
          ].map(s => (
            <div key={s.label} className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* User Management */}
        <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <i className="fas fa-users text-purple-400"></i> User Management
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 text-xs uppercase">
                  <th className="text-left py-3">User</th>
                  <th className="text-center py-3">Token</th>
                  <th className="text-center py-3">Status</th>
                  <th className="text-center py-3">Checks</th>
                  <th className="text-center py-3">Expires</th>
                  <th className="text-center py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-3 text-white font-semibold">{user.username}</td>
                    <td className="py-3 text-center"><code className="bg-[#0a0a0f] px-2 py-1 rounded text-cyan-400 text-xs">{user.token}</code></td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${user.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono">{user.checks}</td>
                    <td className="py-3 text-center text-gray-500">{user.expires}</td>
                    <td className="py-3 text-center">
                      <button className="text-purple-400 hover:text-white mr-2"><i className="fas fa-edit"></i></button>
                      <button className="text-red-400 hover:text-red-300"><i className="fas fa-ban"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Key */}
        <div className="bg-[#12121a] border border-purple-500/10 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <i className="fas fa-key text-yellow-400"></i> Generate Access Keys
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="@username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="bg-[#0a0a0f] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <select
              value={newUser.duration}
              onChange={(e) => setNewUser({...newUser, duration: parseInt(e.target.value)})}
              className="bg-[#0a0a0f] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value={1}>1 Day</option>
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={365}>1 Year</option>
            </select>
            <button onClick={generateKey} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
              <i className="fas fa-magic mr-2"></i> Generate Token
            </button>
          </div>
          {generatedToken && (
            <div className="mt-4 p-3 bg-[#0a0a0f] rounded-lg border border-purple-500/30">
              <div className="text-xs text-gray-500 mb-1">Generated Token:</div>
              <code className="text-cyan-400 font-mono text-sm break-all">{generatedToken}</code>
              <button onClick={copyToken} className="mt-2 text-xs text-purple-400 hover:text-white">
                <i className="fas fa-copy mr-1"></i> Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
