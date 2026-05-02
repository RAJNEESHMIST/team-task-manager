import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser && appUser.role !== 'GLOBAL_ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    if (appUser) {
      fetchUsers();
    }
  }, [appUser, navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestriction = async (email, currentRestricted) => {
    if (window.confirm(`Are you sure you want to ${currentRestricted ? 'unrestrict' : 'restrict'} this user?`)) {
      try {
        await api.patch(`/admin/users/${email}/restrict`, { restricted: !currentRestricted });
        fetchUsers();
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
        fetchUsers();
      } catch (err) {
        console.error("Failed to toggle role", err);
        alert("Failed to update role");
      }
    }
  };

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
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Admin Hub</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Manage users, permissions, and system-wide settings.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${u.role === 'GLOBAL_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                        {u.role === 'GLOBAL_ADMIN' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${u.restricted ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {u.restricted ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {u.email !== appUser.email && (
                        <>
                          <button 
                            onClick={() => toggleRole(u.email, u.role)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            {u.role === 'GLOBAL_ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button 
                            onClick={() => toggleRestriction(u.email, u.restricted)}
                            className={`${u.restricted ? 'text-emerald-600 hover:text-emerald-900' : 'text-red-600 hover:text-red-900'} font-medium`}
                          >
                            {u.restricted ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </>
                      )}
                      {u.email === appUser.email && (
                        <span className="text-slate-400 italic">You</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
