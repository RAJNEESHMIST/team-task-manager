import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const SearchableSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div 
        className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-slate-700 font-medium" : "text-slate-400"}>{value || "Search & Select..."}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
            <input 
              type="text" 
              className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Type to search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="p-1">
            <div 
              className="p-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 rounded-lg font-medium"
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              Unassigned
            </div>
            {filteredOptions.map(opt => (
              <div 
                key={opt}
                className="p-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 rounded-lg"
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(""); }}
              >
                {opt}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-3 text-sm text-slate-400 text-center">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'MEDIUM' });
  const [taskToEdit, setTaskToEdit] = useState({ id: '', title: '', description: '', assignedTo: '', dueDate: '', priority: 'MEDIUM' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes, membersRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
        api.get(`/projects/${id}/members`),
        api.get('/users')
      ]);
      setProject(projRes.data);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      
      // Combine project members and all known users to ensure no one is missed
      const projectMemberEmails = Array.isArray(membersRes.data) ? membersRes.data.map(m => m.userEmail) : [];
      const allKnownEmails = Array.isArray(usersRes.data) ? usersRes.data : [];
      const combinedUniqueUsers = [...new Set([...projectMemberEmails, ...allKnownEmails])];
      setAllUsers(combinedUniqueUsers);
    } catch (error) {
      console.error('Error fetching project data', error);
      setTasks([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'MEDIUM' });
      alert('Congratulations! You created task under project successfully.');
      fetchProjectData();
    } catch (error) {
      console.error('Error creating task', error);
      alert('Failed to create task (Admin only)');
    }
  };

  const [confirmDelete, setConfirmDelete] = useState({ type: null, id: null });

  const handleDeleteProject = async () => {
    console.log("Delete project button clicked");
    try {
      await api.delete(`/projects/${id}`);
      alert('Project and tasks under this deleted successfully.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project', error);
      alert('Failed to delete project. Make sure you are the project creator or global admin.');
    } finally {
      setConfirmDelete({ type: null, id: null });
    }
  };

  const handleDeleteTask = async (taskId) => {
    console.log("Delete task button clicked", taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      alert('Task deleted successfully.');
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting task', error);
      alert('Failed to delete task. Make sure you are the task creator or admin.');
    } finally {
      setConfirmDelete({ type: null, id: null });
    }
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit({
      id: task.id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'MEDIUM'
    });
    setShowEditTaskModal(true);
  };

  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/tasks/${taskToEdit.id}`, taskToEdit);
      setShowEditTaskModal(false);
      fetchProjectData();
    } catch (error) {
      console.error('Error editing task', error);
      alert('Failed to edit task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        alert('Task deleted successfully.');
        fetchProjectData();
      } catch (error) {
        console.error('Error deleting task', error);
        alert('Failed to delete task. Make sure you are the task creator or admin.');
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      alert('Member added successfully!');
    } catch (error) {
      console.error('Error adding member', error);
      alert('Failed to add member (Admin only)');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectData();
    } catch (error) {
      console.error('Error updating task status', error);
      alert('Failed to update status');
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
  
  if (!project) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-80px)] flex-col">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Project Not Found</h2>
        <Link to="/projects" className="mt-4 text-indigo-600 hover:underline">Return to Projects</Link>
      </div>
    </div>
  );

  const priorityColors = {
    HIGH: 'bg-red-50 text-red-700 border border-red-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  };

  const statusColors = {
    DONE: 'bg-emerald-100 text-emerald-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    TODO: 'bg-slate-100 text-slate-800'
  };

  const today = new Date().toISOString().split('T')[0];

  const getTaskStyle = (task) => {
    if (task.status === 'DONE') return 'border-slate-200 bg-slate-50/50 opacity-75';
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
    
    if (isOverdue) {
      if (task.priority === 'HIGH') return 'border-red-500 bg-red-50 shadow-sm shadow-red-100';
      if (task.priority === 'MEDIUM') return 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100';
      return 'border-amber-500 bg-amber-50 shadow-sm shadow-amber-100';
    }
    
    if (task.priority === 'HIGH') return 'border-l-4 border-l-red-500 border-slate-200 hover:border-red-300 bg-white';
    if (task.priority === 'MEDIUM') return 'border-l-4 border-l-amber-500 border-slate-200 hover:border-amber-300 bg-white';
    if (task.priority === 'LOW') return 'border-l-4 border-l-emerald-500 border-slate-200 hover:border-emerald-300 bg-white';
    
    return 'border-slate-200 bg-white';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="w-full">
              <Link to="/projects" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-4 uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Projects
              </Link>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{project.name}</h1>
              <p className="text-slate-500 mt-4 flex items-center text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Created on {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            {(project.createdBy === user?.email || appUser?.role === 'GLOBAL_ADMIN') && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setConfirmDelete({ type: 'PROJECT', id: id })}
                  className="flex-1 sm:flex-none flex items-center justify-center px-5 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
                <button 
                  onClick={() => setShowMemberModal(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center px-5 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Invite
                </button>
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-gradient-primary rounded-xl font-bold shadow-lg shadow-indigo-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Project Tasks</h3>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{tasks.length} total</span>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Your board is empty</h3>
              <p className="text-slate-500 mt-1 max-w-sm mb-6">Start planning your project by creating tasks and assigning them to your team.</p>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="px-5 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Create First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tasks.map(task => {
                const canUpdateStatus = project.createdBy === user?.email || task.assignedTo === user?.email || appUser?.role === 'GLOBAL_ADMIN';
                const canUpdateFull = task.createdBy === user?.email || appUser?.role === 'GLOBAL_ADMIN';
                return (
                <div key={task.id} className={`p-5 rounded-2xl shadow-sm border transition-all flex flex-col group ${getTaskStyle(task)}`}>
                  
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                      {task.priority || 'MEDIUM'}
                    </span>
                    {canUpdateStatus ? (
                      <select 
                        className={`text-xs font-bold uppercase tracking-wider rounded-lg px-2 py-1 outline-none cursor-pointer appearance-none ${statusColors[task.status] || statusColors.TODO}`}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColors[task.status] || statusColors.TODO}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 mt-1">
                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{task.title}</h4>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">{task.description}</p>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate max-w-[180px]">{task.createdBy ? `Assigned by: ${task.createdBy}` : 'Assigned by: System'}</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {task.dueDate}
                        </div>
                      )}
                    </div>
                    {canUpdateFull && (
                      <div className="flex justify-end space-x-2 pt-2 mt-2 border-t border-slate-50 border-dashed">
                        <button onClick={() => handleOpenEditTask(task)} className="flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => setConfirmDelete({ type: 'TASK', id: task.id })} className="flex items-center px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-200 hover:border-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </section>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Create New Task</h3>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text" required placeholder="Design the homepage"
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all"
                    value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    placeholder="Add details about what needs to be done..." rows="3"
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all resize-none"
                    value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                    <SearchableSelect 
                      options={allUsers}
                      value={newTask.assignedTo}
                      onChange={(val) => setNewTask({...newTask, assignedTo: val})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      min={today}
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all text-slate-600"
                      value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all text-slate-700"
                    value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="LOW">Low - No rush</option>
                    <option value="MEDIUM">Medium - Normal timeframe</option>
                    <option value="HIGH">High - Urgent</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-gradient-primary rounded-xl font-medium shadow-md">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditTaskModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Edit Task</h3>
                <button onClick={() => setShowEditTaskModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleEditTaskSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text" required
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all"
                    value={taskToEdit.title} onChange={(e) => setTaskToEdit({...taskToEdit, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all resize-none"
                    value={taskToEdit.description} onChange={(e) => setTaskToEdit({...taskToEdit, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                    <SearchableSelect 
                      options={allUsers}
                      value={taskToEdit.assignedTo}
                      onChange={(val) => setTaskToEdit({...taskToEdit, assignedTo: val})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all text-slate-600"
                      value={taskToEdit.dueDate} onChange={(e) => setTaskToEdit({...taskToEdit, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all text-slate-700"
                    value={taskToEdit.priority} onChange={(e) => setTaskToEdit({...taskToEdit, priority: e.target.value})}
                  >
                    <option value="LOW">Low - No rush</option>
                    <option value="MEDIUM">Medium - Normal timeframe</option>
                    <option value="HIGH">High - Urgent</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setShowEditTaskModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-gradient-primary rounded-xl font-medium shadow-md">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Modal */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Invite Team Member</h3>
                <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-6">Enter the email address of the team member you want to invite to {project.name}.</p>
              <form onSubmit={handleAddMember}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email" required placeholder="colleague@company.com" autoFocus
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 transition-all"
                    value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowMemberModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-medium shadow-md transition-colors">Send Invite</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmDelete.type && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Are you absolutely sure?</h3>
              <p className="text-sm text-slate-500 text-center mb-8">
                {confirmDelete.type === 'PROJECT' 
                  ? "This will permanently delete the project and all associated tasks. This action cannot be undone."
                  : "This task will be permanently removed from your project."
                }
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => confirmDelete.type === 'PROJECT' ? handleDeleteProject() : handleDeleteTask(confirmDelete.id)}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                >
                  Yes, Delete {confirmDelete.type === 'PROJECT' ? 'Project' : 'Task'}
                </button>
                <button 
                  onClick={() => setConfirmDelete({ type: null, id: null })}
                  className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;
