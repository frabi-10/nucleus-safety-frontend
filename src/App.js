import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, FileText, Lock, User, MapPin, Target, TrendingUp, BarChart3, PieChart, Activity, AlertCircle, MessageCircle, Send, Trash2, Menu, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// SECURITY: Password should be stored in environment variable and validated server-side
const REPORTS_PASSWORD = process.env.REACT_APP_REPORTS_PASSWORD || 'nucleus2024';

const SafetyReportApp = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [assignTo, setAssignTo] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    type: '',
    location: '',
    sub_location: '',
    specific_room: '',
    description: '',
    actions_taken: '',
    observer_name: '',
    observer_email: '',
    photo: null,
    priority: 'Medium'
  });

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const reportTypes = [
    'Near Miss',
    'Injury',
    'Equipment Issue',
    'Spill',
    'Fire Hazard',
    'Safety Observation',
    'Other'
  ];

  const locations = {
    'Building 929': {
      areas: {
        'Sapharie Room': [],
        'Cleanroom': []
      }
    },
    'Building 908': {
      areas: {
        'Cleanroom': [
          'Lab 1',
          'Lab 2',
          'Lab 3',
          'Lab 4',
          'Common area',
          'Powder Common Area',
          'Powder Dispense room 1',
          'Powder Dispense room 2',
          'Powder Dispense room 3',
          'Powder Dispense room 4',
          'ChemSpeed room'
        ],
        'Warehouse': []
      }
    }
  };

  useEffect(() => {
    if ((activeTab === 'view' || activeTab === 'assigned') && isAuthenticated) {
      fetchReports();
    }
    if (activeTab === 'analytics' && isAuthenticated) {
      fetchReports();
      fetchStatistics();
    }
  }, [activeTab, isAuthenticated]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/reports`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Unable to load reports. Please try again.');
      showToast('Failed to load reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
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

  const handleAddComment = async (reportId) => {
    if (!newComment.trim() || !commentAuthor.trim()) {
      showToast('Please enter both your name and comment', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: commentAuthor,
          comment_text: newComment
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(reportId);
        fetchReports();
        showToast('Comment added successfully', 'success');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment', 'error');
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const report = reports.find(r => r.id === reportId);
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          priority: report.priority,
          assigned_to: report.assigned_to,
          assigned_by: report.assigned_by,
          due_date: report.due_date
        })
      });

      if (response.ok) {
        fetchReports();
        showToast(`Status updated to ${newStatus}`, 'success');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleAssignReport = async (reportId) => {
    const assigneeName = assignTo[reportId];
    if (!assigneeName?.trim()) {
      showToast('Please enter a name to assign', 'error');
      return;
    }

    try {
      const report = reports.find(r => r.id === reportId);
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: report.status,
          priority: report.priority,
          assigned_to: assigneeName,
          assigned_by: commentAuthor || 'Admin',
          due_date: report.due_date
        })
      });

      if (response.ok) {
        setAssignTo(prev => ({ ...prev, [reportId]: '' }));
        fetchReports();
        showToast(`Report assigned to ${assigneeName}`, 'success');
      } else {
        throw new Error('Failed to assign report');
      }
    } catch (error) {
      console.error('Error assigning report:', error);
      showToast('Failed to assign report', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/all`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReports([]);
        setShowDeleteConfirm(false);
        showToast('All reports deleted successfully', 'success');
        fetchReports();
      } else {
        throw new Error('Failed to delete reports');
      }
    } catch (error) {
      console.error('Error deleting reports:', error);
      showToast('Failed to delete reports', 'error');
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

  const handleTabChange = (tab) => {
    if ((tab === 'view' || tab === 'analytics' || tab === 'assigned') && !isAuthenticated) {
      setShowPasswordModal(true);
      setActiveTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'location') {
        updated.sub_location = '';
        updated.specific_room = '';
      } else if (name === 'sub_location') {
        updated.specific_room = '';
      }
      return updated;
    });
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine location info for backend
      const submitData = {
        ...formData,
        // Combine sub_location to include specific room if selected
        sub_location: formData.specific_room 
          ? `${formData.sub_location} - ${formData.specific_room}`
          : formData.sub_location
      };

      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          type: '',
          location: '',
          sub_location: '',
          specific_room: '',
          description: '',
          actions_taken: '',
          observer_name: '',
          observer_email: '',
          photo: null,
          priority: 'Medium'
        });
        setPhotoPreview(null);
        showToast('Report submitted successfully!', 'success');

        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast('Error submitting report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
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
      case 'Safety Observation': return '👁️';
      case 'Other': return '📋';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 ease-in-out ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } animate-slide-in`}>
          <div className="flex items-center space-x-3">
            {toast.type === 'success' ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <Lock className="mx-auto text-purple-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Protected Area</h2>
              <p className="text-gray-600">Enter password to access reports</p>
            </div>
            
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
                    setActiveTab('submit');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🗑️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete All Reports?</h2>
              <p className="text-gray-600">
                This will permanently delete all {reports.length} reports. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Nucleus Biologics</h1>
              <p className="text-purple-100 text-sm md:text-lg">Safety Reporting System</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm text-purple-100">Powered by</div>
              <div className="text-xl md:text-2xl font-bold">a Rabi Product</div>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-purple-700 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="mt-6 md:mt-8 hidden md:flex space-x-2">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'submit'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:text-purple-100'
              }`}
            >
            Submit Report
            </button>
            <button
              onClick={() => handleTabChange('view')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center ${
                activeTab === 'view'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:text-purple-100'
              }`}
            >
              {!isAuthenticated && <Lock size={16} className="mr-2" />}
            View Reports
            </button>
            <button
              onClick={() => handleTabChange('assigned')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center ${
                activeTab === 'assigned'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:text-purple-100'
              }`}
            >
              {!isAuthenticated && <Lock size={16} className="mr-2" />}
              Assigned
            </button>
            <button
              onClick={() => handleTabChange('analytics')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center ${
                activeTab === 'analytics'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:text-purple-100'
              }`}
            >
              {!isAuthenticated && <Lock size={16} className="mr-2" />}
              Analytics
            </button>
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2 pb-4 animate-fade-in">
              <button
                onClick={() => { setActiveTab('submit'); setMobileMenuOpen(false); }}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'submit'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                Submit Report
              </button>
              <button
                onClick={() => { handleTabChange('view'); setMobileMenuOpen(false); }}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  activeTab === 'view'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                {!isAuthenticated && <Lock size={16} className="mr-2" />}
                View Reports
              </button>
              <button
                onClick={() => { handleTabChange('assigned'); setMobileMenuOpen(false); }}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  activeTab === 'assigned'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                {!isAuthenticated && <Lock size={16} className="mr-2" />}
                Assigned
              </button>
              <button
                onClick={() => { handleTabChange('analytics'); setMobileMenuOpen(false); }}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  activeTab === 'analytics'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                {!isAuthenticated && <Lock size={16} className="mr-2" />}
                Analytics
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {submitSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Your safety report has been submitted successfully.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Report a Safety Concern</h2>
                  <p className="text-gray-600">Please provide detailed information about the incident or concern.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Report Type & Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incident Type *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Type</option>
                        {reportTypes.map(type => (
                          <option key={type} value={type}>{getTypeEmoji(type)} {type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level *
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building *
                      </label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {Object.keys(locations).map(building => (
                          <option key={building} value={building}>{building}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area *
                      </label>
                      <select
                        name="sub_location"
                        value={formData.sub_location}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.location}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select...</option>
                        {formData.location && Object.keys(locations[formData.location].areas).map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specific Room
                      </label>
                      <select
                        name="specific_room"
                        value={formData.specific_room}
                        onChange={handleInputChange}
                        disabled={!formData.sub_location}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select...</option>
                        {formData.location && formData.sub_location && 
                          locations[formData.location].areas[formData.sub_location].map(room => (
                            <option key={room} value={room}>{room}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      placeholder="Describe what happened, what was observed, or what the concern is..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Actions Taken */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Immediate Actions Taken
                    </label>
                    <textarea
                      name="actions_taken"
                      value={formData.actions_taken}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe any immediate actions taken to address the situation..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Observer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="observer_name"
                        value={formData.observer_name}
                        onChange={handleInputChange}
                        placeholder="Optional - for follow-up"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="observer_email"
                        value={formData.observer_email}
                        onChange={handleInputChange}
                        placeholder="Optional - for follow-up"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo Evidence (Optional)
                    </label>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
                      {/* Take Photo Button */}
                      <label className="flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                        <Camera className="mr-2" size={20} />
                        Take Photo
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoCapture}
                          className="hidden"
                        />
                      </label>
                      
                      {/* Upload Photo Button */}
                      <label className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                        <FileText className="mr-2" size={20} />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoCapture}
                          className="hidden"
                        />
                      </label>
                      
                      {photoPreview && (
                        <div className="relative">
                          <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg shadow-md" />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setFormData(prev => ({ ...prev, photo: null }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Submitting...
                      </span>
                    ) : (
                      '📨 Submit Report'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* View Reports Tab */}
        {activeTab === 'view' && isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Header with Clear All button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Safety Reports</h2>
                <p className="text-gray-600 mt-1">{reports.length} total reports</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={reports.length === 0 || isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md hover:shadow-lg"
              >
                <Trash2 size={16} className="mr-2" />
                Clear All
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                <p className="text-gray-500 text-lg">Loading reports...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-red-400 mb-4" size={64} />
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <button
                  onClick={fetchReports}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Reports List */}
            <div className="space-y-4">
              {!isLoading && !error && reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 text-lg">No reports submitted yet</p>
                  <p className="text-gray-400 mt-2">Reports will appear here once submitted</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        const newSelected = selectedReport === report.id ? null : report.id;
                        setSelectedReport(newSelected);
                        if (newSelected && !comments[report.id]) {
                          fetchComments(report.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-3xl">{getTypeEmoji(report.type)}</span>
                            <div>
                              <h3 className="font-bold text-xl text-gray-800">{report.type}</h3>
                              <p className="text-sm text-gray-500">
                                {report.location}
                                {report.sub_location && ` - ${report.sub_location}`}
                                {report.specific_room && ` - ${report.specific_room}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              <span>{report.status}</span>
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(report.priority)}`}>
                              {report.priority} Priority
                            </span>
                          </div>

                          <p className="text-gray-600 line-clamp-2">{report.description}</p>
                          
                          <div className="text-sm text-gray-500 mt-3 flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                            {report.comment_count > 0 && (
                              <span className="flex items-center">
                                <MessageCircle size={14} className="mr-1" />
                                {report.comment_count} comments
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button className="text-gray-400 hover:text-gray-600 ml-4">
                          {selectedReport === report.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                      </div>
                    </div>

                    {selectedReport === report.id && (
                      <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                        <div className="space-y-6 mt-6">
                          {/* Status Update Buttons */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Update Status</p>
                            <div className="flex flex-wrap gap-2">
                              {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(report.id, status)}
                                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    report.status === status
                                      ? 'bg-purple-600 text-white shadow-md'
                                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Assign To */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Assign To
                              {report.assigned_to && (
                                <span className="ml-2 text-purple-600">
                                  (Currently: {report.assigned_to})
                                </span>
                              )}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={assignTo[report.id] || ''}
                                onChange={(e) => setAssignTo(prev => ({ ...prev, [report.id]: e.target.value }))}
                                placeholder="Enter name to assign..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <button
                                onClick={() => handleAssignReport(report.id)}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
                              >
                                Assign
                              </button>
                            </div>
                          </div>

                          {/* Report Details */}
                          <div className="border-t pt-4">
                            {report.actions_taken && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Actions Taken</p>
                                <p className="text-gray-800">{report.actions_taken}</p>
                              </div>
                            )}

                            {report.observer_name && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Reported By</p>
                                <p className="text-gray-800">
                                  {report.observer_name}
                                  {report.observer_email && ` (${report.observer_email})`}
                                </p>
                              </div>
                            )}

                            {report.photo && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Photo Evidence</p>
                                <img 
                                  src={report.photo} 
                                  alt="Evidence" 
                                  className="max-w-md rounded-lg shadow-md"
                                />
                              </div>
                            )}
                          </div>

                          {/* Comments Section */}
                          <div className="border-t pt-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <MessageCircle size={20} className="mr-2 text-purple-600" />
                              Comments ({comments[report.id]?.length || 0})
                            </h4>

                            {/* Existing Comments */}
                            <div className="space-y-3 mb-4">
                              {comments[report.id]?.length > 0 ? (
                                comments[report.id].map(comment => (
                                  <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                      <p className="font-medium text-gray-800">{comment.user_name}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                    <p className="text-gray-700">{comment.comment_text}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-center py-4">No comments yet</p>
                              )}
                            </div>

                            {/* Add Comment */}
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                              <p className="text-sm font-medium text-gray-700 mb-3">Add Comment</p>
                              <input
                                type="text"
                                value={commentAuthor}
                                onChange={(e) => setCommentAuthor(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                              />
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3 resize-none"
                              />
                              <button
                                onClick={() => handleAddComment(report.id)}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium flex items-center justify-center"
                              >
                                <Send size={16} className="mr-2" />
                                Post Comment
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                            <span>Created: {new Date(report.created_at).toLocaleString()}</span>
                            <span>Updated: {new Date(report.updated_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Assigned Reports Tab */}
        {activeTab === 'assigned' && isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Assigned Reports</h2>
              <p className="text-gray-600 mt-1">
                {reports.filter(r => r.assigned_to).length} reports currently assigned
              </p>
            </div>

            <div className="space-y-4">
              {reports.filter(r => r.assigned_to).length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 text-lg">No assigned reports</p>
                  <p className="text-gray-400 mt-2">Reports will appear here once assigned to team members</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.filter(r => r.assigned_to).map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedReport(selectedReport === report.id ? null : report.id);
                              if (selectedReport !== report.id && !comments[report.id]) {
                                fetchComments(report.id);
                              }
                              setActiveTab('view');
                            }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{getTypeEmoji(report.type)}</span>
                              <span className="text-sm font-medium text-gray-900">{report.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.location}
                            {report.sub_location && ` - ${report.sub_location}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User size={16} className="mr-2 text-purple-600" />
                              <span className="text-sm font-medium text-gray-900">{report.assigned_to}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                              {report.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && isAuthenticated && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
            
            {!stats ? (
              <div className="text-center py-12">
                <Activity className="mx-auto text-gray-300 mb-4 animate-pulse" size={64} />
                <p className="text-gray-500">Loading statistics...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <PieChart size={24} className="mr-2 text-purple-600" />
                      Status Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={stats.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.status}: ${entry.count}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {stats.byStatus.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={
                                entry.status === 'Open' ? '#ef4444' :
                                entry.status === 'In Progress' ? '#f59e0b' :
                                entry.status === 'Resolved' ? '#10b981' :
                                '#6b7280'
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="priority" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Incident Types */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 size={24} className="mr-2 text-purple-600" />
                      Top Incident Types
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.byType} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" stroke="#666" />
                        <YAxis dataKey="type" type="category" width={150} stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Location Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <MapPin size={24} className="mr-2 text-purple-600" />
                    Reports by Location
                  </h3>
                  <div className="space-y-3">
                    {stats.byLocation.map((location, index) => {
                      const maxCount = Math.max(...stats.byLocation.map(l => l.count));
                      const percentage = (location.count / maxCount) * 100;
                      return (
                        <div key={index} className="flex items-center">
                          <div className="w-32 text-sm font-medium text-gray-700">{location.location}</div>
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
          </div>
        )}
      </main>
    </div>
  );
};

export default SafetyReportApp;