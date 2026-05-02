import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Tilt from 'react-parallax-tilt';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ 
    assignedToMe: [], 
    assignedToOthers: [], 
    totalAssignedToMe: 0, 
    totalAssignedToOthers: 0, 
    totalTasks: 0 
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignedToMe');
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateSort, setDateSort] = useState('ASC');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data || { assignedToMe: [], assignedToOthers: [], totalAssignedToMe: 0, totalAssignedToOthers: 0, totalTasks: 0 });
    } catch (error) {
      console.error('Error fetching dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchDashboard();
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update task status');
    }
  };

  const getPriorityAccent = (priority) => {
    if (priority === 'HIGH') return 'from-rose-500 to-red-600 shadow-red-500/30';
    if (priority === 'MEDIUM') return 'from-amber-400 to-orange-500 shadow-orange-500/30';
    return 'from-emerald-400 to-teal-500 shadow-teal-500/30';
  };

  const getStatusBadge = (status) => {
    if (status === 'DONE') return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    if (status === 'IN_PROGRESS') return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    return 'bg-slate-50 text-slate-600 border-slate-200/50';
  };

  const applyFilters = (tasks) => {
    if (!tasks) return [];
    let filtered = [...tasks];
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return dateSort === 'ASC' 
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    });
    return filtered;
  };

  const displayedTasks = activeTab === 'assignedToMe' 
    ? applyFilters(data.assignedToMe) 
    : applyFilters(data.assignedToOthers);

  // Chart Data
  const allTasks = [...(data.assignedToMe || []), ...(data.assignedToOthers || [])];
  
  const statusCounts = allTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = [
    { name: 'To Do', value: statusCounts['TODO'] || 0, color: '#94a3b8' },
    { name: 'In Progress', value: statusCounts['IN_PROGRESS'] || 0, color: '#818cf8' },
    { name: 'Done', value: statusCounts['DONE'] || 0, color: '#34d399' }
  ].filter(d => d.value > 0);

  const workloadData = [
    { name: 'Assigned to Me', tasks: data.totalAssignedToMe || 0, fill: '#6366f1' },
    { name: 'I Assigned', tasks: data.totalAssignedToOthers || 0, fill: '#14b8a6' }
  ];

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
      
      {/* Responsive Header Background */}
      <div className="bg-slate-900 pt-16 pb-32 px-4 md:px-6 -mt-[1px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">Dashboard Analytics</h2>
            <p className="text-indigo-200 mt-4 text-sm md:text-lg font-medium opacity-90 leading-relaxed">Track your workload and delegated tasks efficiently.</p>
          </div>
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/20 text-white flex flex-col items-center md:items-end shadow-2xl shadow-slate-950/20">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.25em] mb-2">Total Platform Tasks</p>
            <p className="text-5xl font-black">{data.totalTasks}</p>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 space-y-8 relative z-10">

        {/* Charts Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl bg-white shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Task Distribution by Status
            </h3>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-white shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Workload Comparison
            </h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14, fontWeight: 500}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="tasks" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Filters and Tabs */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-full lg:w-auto">
              <button 
                onClick={() => setActiveTab('assignedToMe')}
                className={`flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'assignedToMe' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Assigned to Me ({data.totalAssignedToMe})
              </button>
              <button 
                onClick={() => setActiveTab('assignedToOthers')}
                className={`flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'assignedToOthers' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                I Assigned ({data.totalAssignedToOthers})
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 w-full lg:w-auto">
              <select 
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-bold"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <select 
                value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-bold"
              >
                <option value="ALL">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select 
                value={dateSort} onChange={(e) => setDateSort(e.target.value)}
                className="col-span-2 md:col-span-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-bold"
              >
                <option value="ASC">Earliest Due</option>
                <option value="DESC">Latest Due</option>
              </select>
            </div>
            
          </div>
        </section>

        {/* Task Grid */}
        <section>
          {displayedTasks.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700">No tasks found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or check a different tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTasks.map(task => (
                <Tilt 
                  key={task.id} 
                  tiltMaxAngleX={5} 
                  tiltMaxAngleY={5} 
                  perspective={1000} 
                  transitionSpeed={1000} 
                  scale={1.02}
                  className="h-full"
                  glareEnable={true}
                  glareMaxOpacity={0.15}
                  glareColor="#ffffff"
                  glarePosition="all"
                  glareBorderRadius="12px"
                >
                <div className={`relative h-full p-6 rounded-2xl flex flex-col group transition-all duration-500 bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(6,81,237,0.12)] overflow-hidden ${task.status === 'DONE' ? 'opacity-80' : ''}`}>

                  {/* Top Accent Gradient Line */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${getPriorityAccent(task.priority)} opacity-90 group-hover:opacity-100 transition-opacity`} />

                  {/* Header: Project & Overdue Warning */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPriorityAccent(task.priority)} shadow-sm`} />
                      <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500">
                        {task.projectName}
                      </span>
                    </div>
                    
                    {(task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) && task.status !== 'DONE') && (
                      <span className="flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold tracking-widest uppercase border border-red-100 shadow-sm shadow-red-500/10 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed font-medium">
                      {task.description}
                    </p>
                  </div>

                  {/* Meta Grid */}
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    {/* User Avatar Section */}
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100/80 group-hover:bg-slate-50 transition-colors">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center text-sm font-bold shadow-sm border border-indigo-50">
                        {activeTab === 'assignedToMe' 
                          ? (task.createdBy ? task.createdBy[0].toUpperCase() : 'S')
                          : (task.assignedTo ? task.assignedTo[0].toUpperCase() : 'U')
                        }
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">
                          {activeTab === 'assignedToMe' ? 'Assigned By' : 'Assigned To'}
                        </span>
                        <span className="text-xs font-bold text-slate-700 truncate">
                          {activeTab === 'assignedToMe' ? (task.createdBy || 'System') : (task.assignedTo || 'Unassigned')}
                        </span>
                      </div>
                    </div>

                    {/* Date Section */}
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100/80 group-hover:bg-slate-50 transition-colors">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white text-slate-400 flex items-center justify-center shadow-sm border border-slate-200/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Due Date</span>
                        <span className={`text-xs font-bold truncate ${task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) && task.status !== 'DONE' ? 'text-red-600' : 'text-slate-700'}`}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                    <div className={`px-3.5 py-1.5 rounded-full border text-[10px] font-extrabold tracking-widest uppercase shadow-sm ${getStatusBadge(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </div>

                    <div className="relative group/select">
                      <select 
                        className="appearance-none pl-4 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 group-hover/select:text-indigo-600 transition-colors">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                </div>
                </Tilt>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
