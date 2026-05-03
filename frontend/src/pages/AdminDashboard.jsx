import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const AdminDashboard = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser && appUser.role !== 'GLOBAL_ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    if (appUser) {
      fetchData();
    }
  }, [appUser, navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestriction = async (email, currentRestricted) => {
    if (window.confirm(`Are you sure you want to ${currentRestricted ? 'unrestrict' : 'restrict'} this user?`)) {
      try {
        await api.patch(`/admin/users/${email}/restrict`, { restricted: !currentRestricted });
        fetchData();
      } catch (err) {
        console.error("Failed to toggle restriction", err);
        alert("Failed to update user");
      }
    }
  };

  const toggleRole = async (email, currentRole) => {
    const newRole = currentRole === 'GLOBAL_ADMIN' ? 'USER' : 'GLOBAL_ADMIN';
    if (window.confirm(`Are you sure you want to make this user a ${newRole}?`)) {
      try {
        await api.patch(`/admin/users/${email}/role`, { role: newRole });
        fetchData();
      } catch (err) {
        console.error("Failed to toggle role", err);
        alert("Failed to update role");
      }
    }
  };

  const pieData = stats ? Object.entries(stats.tasksByStatus).map(([name, value]) => ({
    name,
    value,
    color: name === 'DONE' ? '#10b981' : name === 'IN_PROGRESS' ? '#6366f1' : '#94a3b8'
  })) : [];

  const barData = stats ? stats.userTaskStats.map(stat => ({
    name: stat.email.split('@')[0],
    tasks: stat.taskCount
  })) : [];

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Admin Hub</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-medium opacity-80">Portal-wide visibility and user management.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Users</p>
            <p className="text-4xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Projects</p>
            <p className="text-4xl font-black text-indigo-600">{stats?.totalProjects || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Tasks</p>
            <p className="text-4xl font-black text-emerald-600">{stats?.totalTasks || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3" />
              Global Task Status
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3" />
              User Task Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800">User Management</h3>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{users.length} Registered Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">User Email</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.email} className="hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6 font-bold text-slate-700">{u.email}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'GLOBAL_ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role === 'GLOBAL_ADMIN' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.restricted ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.restricted ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-4">
                      {u.email !== appUser.email && (
                        <>
                          <button 
                            onClick={() => toggleRole(u.email, u.role)}
                            className="text-indigo-600 hover:text-indigo-900 font-bold transition-colors"
                          >
                            {u.role === 'GLOBAL_ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button 
                            onClick={() => toggleRestriction(u.email, u.restricted)}
                            className={`${u.restricted ? 'text-emerald-600 hover:text-emerald-900' : 'text-rose-600 hover:text-rose-900'} font-bold transition-colors`}
                          >
                            {u.restricted ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </>
                      )}
                      {u.email === appUser.email && (
                        <span className="text-slate-300 font-bold italic">Current Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
