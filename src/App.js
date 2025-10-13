import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, FileText, Lock, User, Calendar, AlertCircle, MessageCircle, Send, Search, Filter, X, BarChart3, TrendingUp, MapPin, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API URL Configuration - will use environment variable in production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const SafetyReportApp = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const REPORTS_PASSWORD = 'nucleus2024';
  
  const [formData, setFormData] = useState({
    type: '',
    building: '',
    area: '',
    specificRoom: '',
    description: '',
    actionsTaken: '',
    observerName: '',
    observerEmail: '',
    photo: null,
    priority: 'Medium',
    dueDate: ''
  });

  // Read URL parameters on mount (FOR QR CODES)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const building = urlParams.get('building');
    const area = urlParams.get('area');
    const room = urlParams.get('room');
    
    if (building || area || room) {
      setFormData(prev => ({
        ...prev,
        building: building || '',
        area: area || '',
        specificRoom: room || ''
      }));
      
      // Show a notification that location was pre-filled
      if (building) {
        console.log('📍 Location pre-filled from QR code');
      }
    }
  }, []);

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    reportId: null,
    assignedTo: '',
    priority: '',
    dueDate: ''
  });

  // Comments state
  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [commentUser, setCommentUser] = useState('');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchText: '',
    status: '',
    priority: '',
    type: '',
    assignedTo: ''
  });

  const locationStructure = {
    '929': {
      areas: ['Sapharie Room', 'Cleanroom'],
      rooms: {}
    },
    '908': {
      areas: ['Cleanroom', 'Warehouse'],
      rooms: {
        'Cleanroom': [
          'Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Common area',
          'Powder Dispense room 1', 'Powder Dispense room 2',
          'Powder Dispense room 3', 'Powder Dispense room 4',
          'ChemSpeed room'
        ]
      }
    }
  };

  const reportTypes = ['Near Miss', 'Injury', 'Equipment Issue', 'Spill', 'Fire Hazard', 'Safety Observation'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    if (activeTab === 'view' && isAuthenticated) {
      fetchReports();
      fetchUsers();
    } else if (activeTab === 'analytics' && isAuthenticated) {
      fetchStats();
    }
  }, [activeTab, isAuthenticated]);

  // Apply filters whenever reports or filters change
  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...reports];

    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(report => 
        report.description.toLowerCase().includes(searchLower) ||
        report.type.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower) ||
        (report.sub_location && report.sub_location.toLowerCase().includes(searchLower)) ||
        (report.actions_taken && report.actions_taken.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(report => report.priority === filters.priority);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      if (filters.assignedTo === 'Unassigned') {
        filtered = filtered.filter(report => !report.assigned_to);
      } else {
        filtered = filtered.filter(report => report.assigned_to === filters.assignedTo);
      }
    }

    setFilteredReports(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchText: '',
      status: '',
      priority: '',
      type: '',
      assignedTo: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.searchText || filters.status || filters.priority || filters.type || filters.assignedTo;
  };

  const fetchComments = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}/comments`);
      const data = await response.json();
      setComments(prev => ({ ...prev, [reportId]: data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleComments = async (reportId) => {
    const isExpanded = expandedComments[reportId];
    
    if (!isExpanded) {
      await fetchComments(reportId);
    }
    
    setExpandedComments(prev => ({
      ...prev,
      [reportId]: !isExpanded
    }));
  };

  const handleAddComment = async (reportId) => {
    const commentText = newComment[reportId];
    if (!commentText || !commentText.trim()) return;
    
    if (!commentUser || !commentUser.trim()) {
      alert('Please enter your name first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: commentUser,
          commentText: commentText.trim()
        })
      });

      if (response.ok) {
        setNewComment(prev => ({ ...prev, [reportId]: '' }));
        await fetchComments(reportId);
        await fetchReports();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleTabChange = (tab) => {
    if ((tab === 'view' || tab === 'analytics') && !isAuthenticated) {
      setShowPasswordModal(true);
      setActiveTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === REPORTS_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'building') {
      setFormData(prev => ({
        ...prev,
        building: value,
        area: '',
        specificRoom: ''
      }));
    } else if (name === 'area') {
      setFormData(prev => ({
        ...prev,
        area: value,
        specificRoom: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const locationParts = [
        `Building ${formData.building}`,
        formData.area
      ];
      
      const location = locationParts.join(' - ');
      const subLocation = formData.specificRoom || null;

      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          location: location,
          subLocation: subLocation,
          description: formData.description,
          actionsTaken: formData.actionsTaken,
          observerName: formData.observerName,
          observerEmail: formData.observerEmail,
          photo: formData.photo,
          priority: formData.priority,
          dueDate: formData.dueDate
        })
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          type: '',
          building: '',
          area: '',
          specificRoom: '',
          description: '',
          actionsTaken: '',
          observerName: '',
          observerEmail: '',
          photo: null,
          priority: 'Medium',
          dueDate: ''
        });
        setPhotoPreview(null);
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update status with dropdown
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openAssignModal = (report) => {
    setAssignmentData({
      reportId: report.id,
      assignedTo: report.assigned_to || '',
      priority: report.priority || 'Medium',
      dueDate: report.due_date || ''
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/reports/${assignmentData.reportId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: assignmentData.assignedTo,
          assignedBy: 'Current User',
          priority: assignmentData.priority,
          dueDate: assignmentData.dueDate
        })
      });

      if (response.ok) {
        setShowAssignModal(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="text-red-500" size={20} />;
      case 'In Progress': return <Clock className="text-yellow-500" size={20} />;
      case 'Resolved': return <CheckCircle className="text-green-500" size={20} />;
      case 'Closed': return <XCircle className="text-gray-500" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeEmoji = (type) => {
    switch (type) {
      case 'Near Miss': return '⚠️';
      case 'Injury': return '🚑';
      case 'Equipment Issue': return '🔧';
      case 'Spill': return '💧';
      case 'Fire Hazard': return '🔥';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-6">
              <Lock className="text-purple-600" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Protected Area</h2>
            <p className="text-gray-600 text-center mb-6">Enter password to view reports</p>
            
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                autoFocus
              />
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{passwordError}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordInput('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-6">
              <User className="text-blue-600" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Assign Report</h2>
            <p className="text-gray-600 text-center mb-6">Report #{assignmentData.reportId}</p>
            
            <form onSubmit={handleAssignSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <select
                  value={assignmentData.assignedTo}
                  onChange={(e) => setAssignmentData({...assignmentData, assignedTo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.name}>{user.name} - {user.role}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={assignmentData.priority}
                  onChange={(e) => setAssignmentData({...assignmentData, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {priorities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={assignmentData.dueDate}
                  onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🧬 Nucleus Biologics</h1>
              <p className="text-gray-600 mt-1">Safety Reporting System</p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-purple-600" size={32} />
            </div>
          </div>

          <nav className="mt-6 flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition ${
                activeTab === 'submit'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Submit Report
            </button>
            <button
              onClick={() => handleTabChange('view')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition ${
                activeTab === 'view'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 View Reports
            </button>
            <button
              onClick={() => handleTabChange('analytics')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📈 Analytics
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {submitSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Your safety report has been submitted successfully.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Report a Safety Concern</h2>
                  <p className="text-gray-600">Please provide detailed information about the incident or concern.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select type...</option>
                      {reportTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level *</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {priorities.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Building *</label>
                    <select
                      name="building"
                      value={formData.building}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select...</option>
                      {Object.keys(locationStructure).map(building => (
                        <option key={building} value={building}>Building {building}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.building}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    >
                      <option value="">Select...</option>
                      {formData.building && locationStructure[formData.building].areas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Room</label>
                    <select
                      name="specificRoom"
                      value={formData.specificRoom}
                      onChange={handleInputChange}
                      disabled={!formData.area || !locationStructure[formData.building]?.rooms[formData.area]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    >
                      <option value="">Select...</option>
                      {formData.area && locationStructure[formData.building]?.rooms[formData.area]?.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Resolution Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Describe what happened, what was observed, or what the concern is..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Immediate Actions Taken</label>
                  <textarea
                    name="actionsTaken"
                    value={formData.actionsTaken}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe any immediate actions taken to address the situation..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      name="observerName"
                      value={formData.observerName}
                      onChange={handleInputChange}
                      placeholder="Optional - for follow-up"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                    <input
                      type="email"
                      name="observerEmail"
                      value={formData.observerEmail}
                      onChange={handleInputChange}
                      placeholder="Optional - for follow-up"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="inline mr-2" size={20} />
                    Add Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {photoPreview && (
                    <div className="mt-4">
                      <img src={photoPreview} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 text-lg font-semibold"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Safety Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* View Reports Tab */}
        {activeTab === 'view' && isAuthenticated && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search reports by description, type, location..."
                      value={filters.searchText}
                      onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-3 rounded-lg transition flex items-center justify-center ${
                    showFilters || hasActiveFilters()
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={20} className="mr-2" />
                  Filters
                  {hasActiveFilters() && (
                    <span className="ml-2 bg-white text-purple-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                      {Object.values(filters).filter(v => v).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Dropdowns */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Priorities</option>
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Types</option>
                      {reportTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                    <select
                      value={filters.assignedTo}
                      onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Everyone</option>
                      <option value="Unassigned">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Active Filters & Clear Button */}
              {hasActiveFilters() && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredReports.length}</span> of <span className="font-semibold">{reports.length}</span> reports
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  All Reports
                  {hasActiveFilters() && ` (${filteredReports.length})`}
                </h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter your name for comments"
                    value={commentUser}
                    onChange={(e) => setCommentUser(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {commentUser && (
                    <span className="text-sm text-gray-600">
                      ✓
                    </span>
                  )}
                </div>
              </div>
              
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{hasActiveFilters() ? 'No reports match your filters' : 'No reports submitted yet'}</p>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-purple-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map(report => (
                    <div
                      key={report.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getTypeEmoji(report.type)}</span>
                          <div>
                            <h3 className="font-bold text-lg">{report.type}</h3>
                            <p className="text-sm text-gray-500">Report #{report.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(report.priority)}`}>
                            {report.priority}
                          </span>
                          
                          {/* Status Dropdown */}
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer border-2 border-transparent hover:border-gray-300 transition ${getStatusColor(report.status)}`}
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-600 text-sm font-medium">Location:</span>
                          <p className="font-medium">{report.location}</p>
                          {report.sub_location && (
                            <p className="text-sm text-gray-600 mt-1">→ {report.sub_location}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm font-medium">Submitted:</span>
                          <p className="font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-600 text-sm font-medium flex items-center">
                            <User size={16} className="mr-1" />
                            Assigned To:
                          </span>
                          <p className="font-medium">
                            {report.assigned_to || <span className="text-gray-400 italic">Unassigned</span>}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm font-medium flex items-center">
                            <Calendar size={16} className="mr-1" />
                            Due Date:
                          </span>
                          <p className={`font-medium ${isOverdue(report.due_date) && report.status !== 'Resolved' && report.status !== 'Closed' ? 'text-red-600' : ''}`}>
                            {report.due_date ? (
                              <>
                                {new Date(report.due_date).toLocaleDateString()}
                                {isOverdue(report.due_date) && report.status !== 'Resolved' && report.status !== 'Closed' && (
                                  <span className="ml-2 text-red-600 text-sm">⚠️ OVERDUE</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 italic">Not set</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-gray-600 text-sm font-medium">Description:</span>
                        <p className="mt-1">{report.description}</p>
                      </div>

                      {report.actions_taken && (
                        <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                          <span className="text-gray-600 text-sm font-medium">Actions Taken:</span>
                          <p className="mt-1">{report.actions_taken}</p>
                        </div>
                      )}

                      {report.photo && (
                        <div className="mb-4">
                          <img src={report.photo} alt="Incident" className="max-w-md rounded-lg shadow-md" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-4 border-t mb-4">
                        <button
                          onClick={() => openAssignModal(report)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                        >
                          <User size={16} className="mr-2" />
                          Assign
                        </button>

                        <button
                          onClick={() => toggleComments(report.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center ml-auto"
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Comments {report.comment_count > 0 && `(${report.comment_count})`}
                          {expandedComments[report.id] ? (
                            <ChevronUp size={16} className="ml-2" />
                          ) : (
                            <ChevronDown size={16} className="ml-2" />
                          )}
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments[report.id] && (
                        <div className="border-t pt-4 bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <MessageCircle size={18} className="mr-2" />
                            Discussion Thread
                          </h4>

                          <div className="space-y-3 mb-4">
                            {comments[report.id]?.length > 0 ? (
                              comments[report.id].map(comment => (
                                <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                        {comment.user_name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-sm">{comment.user_name}</p>
                                        <p className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-gray-700">{comment.comment_text}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
                            )}
                          </div>

                          {commentUser ? (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment[report.id] || ''}
                                onChange={(e) => setNewComment({ ...newComment, [report.id]: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddComment(report.id);
                                  }
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                              <button
                                onClick={() => handleAddComment(report.id)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                              >
                                <Send size={16} className="mr-1" />
                                Send
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-yellow-50 rounded-lg">
                              <p className="text-gray-600 text-sm">
                                Please enter your name at the top to comment
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && isAuthenticated && stats && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FileText size={32} className="opacity-80" />
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.total}</h3>
                <p className="text-purple-100">Total Reports</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle size={32} className="opacity-80" />
                  <Target size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.resolutionRate}%</h3>
                <p className="text-green-100">Resolution Rate</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Clock size={32} className="opacity-80" />
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.avgResolutionTime}</h3>
                <p className="text-blue-100">Avg Days to Resolve</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle size={32} className="opacity-80" />
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-1">{stats.overdue}</h3>
                <p className="text-red-100">Overdue Reports</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <TrendingUp size={24} className="mr-2 text-purple-600" />
                  30-Day Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#9333ea" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BarChart3 size={24} className="mr-2 text-purple-600" />
                  Status Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {stats.byStatus.map((entry, index) => {
                        const colors = {
                          'Open': '#ef4444',
                          'In Progress': '#f59e0b',
                          'Resolved': '#10b981',
                          'Closed': '#6b7280'
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.status] || '#9333ea'} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Distribution */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle size={24} className="mr-2 text-purple-600" />
                  Priority Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Incident Types */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FileText size={24} className="mr-2 text-purple-600" />
                  Top Incident Types
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Location Heat Map */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MapPin size={24} className="mr-2 text-purple-600" />
                Location Heat Map
              </h3>
              <div className="space-y-2">
                {stats.byLocation.map((location, index) => {
                  const maxCount = stats.byLocation[0]?.count || 1;
                  const percentage = (location.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-48 text-sm font-medium text-gray-700 truncate">
                        {location.location}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white font-semibold text-sm">
                              {location.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Total Comments</h4>
                <p className="text-3xl font-bold text-purple-600">{stats.totalComments}</p>
                <p className="text-sm text-gray-500 mt-1">Collaborative discussions</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Assignment Rate</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.assignments.find(a => a.assignment_status === 'Assigned')?.count || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Reports assigned to team</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Unassigned</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.assignments.find(a => a.assignment_status === 'Unassigned')?.count || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting assignment</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SafetyReportApp;