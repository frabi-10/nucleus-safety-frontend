import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, MessageSquare, User, Download, Filter, X } from 'lucide-react';
import { useReports, useDeleteReport, useDeleteAllReports, useUpdateReportStatus, useAssignReport } from '@hooks/useReports';
import { useComments, useAddComment } from '@hooks/useComments';
import { Button, Card, Badge, Input, Select, Textarea, Modal, LoadingScreen } from '@components/ui';
import { STATUS_TYPES, STATUS_COLORS, PRIORITY_COLORS, REPORT_TYPES, PRIORITY_LEVELS, FORM_TYPES } from '@utils/constants';
import { formatDate } from '@utils/helpers';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const ViewReportsPage = ({ toast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'all' or report id
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    formType: '',
    type: '',
    priority: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const { data: reports = [], isLoading, error, refetch } = useReports();
  const { mutate: deleteReport } = useDeleteReport();
  const { mutate: deleteAll } = useDeleteAllReports();
  const { mutate: updateStatus } = useUpdateReportStatus();
  const { mutate: assignReport } = useAssignReport();
  const { mutate: addComment } = useAddComment();

  // Get comments for selected report
  const { data: comments = [] } = useComments(selectedReport?.id);

  const handleDeleteSingle = (reportId) => {
    setDeleteTarget(reportId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAll = () => {
    setDeleteTarget('all');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTarget === 'all') {
      deleteAll(undefined, {
        onSuccess: () => {
          toast.success('All reports deleted successfully');
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
          refetch();
        },
        onError: () => {
          toast.error('Failed to delete reports');
        },
      });
    } else {
      deleteReport(deleteTarget, {
        onSuccess: () => {
          toast.success('Report deleted successfully');
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
          setSelectedReport(null);
          refetch();
        },
        onError: () => {
          toast.error('Failed to delete report');
        },
      });
    }
  };

  const handleStatusChange = (reportId, newStatus) => {
    updateStatus(
      { id: reportId, status: newStatus },
      {
        onSuccess: () => {
          toast.success('Status updated successfully');
        },
        onError: () => {
          toast.error('Failed to update status');
        },
      }
    );
  };

  const handleAssign = (reportId) => {
    const assignedTo = prompt('Enter name to assign this report to:');
    if (assignedTo) {
      assignReport(
        { id: reportId, assignedTo, assignedBy: 'Admin' },
        {
          onSuccess: () => {
            toast.success(`Report assigned to ${assignedTo}`);
          },
          onError: () => {
            toast.error('Failed to assign report');
          },
        }
      );
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !userName.trim()) {
      toast.error('Please enter your name and comment');
      return;
    }

    addComment(
      {
        reportId: selectedReport.id,
        commentData: {
          user_name: userName,
          comment_text: commentText,
        },
      },
      {
        onSuccess: () => {
          toast.success('Comment added successfully');
          setCommentText('');
          setUserName('');
        },
        onError: () => {
          toast.error('Failed to add comment');
        },
      }
    );
  };

  const clearFilters = () => {
    setFilters({
      formType: '',
      type: '',
      priority: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      report.type?.toLowerCase().includes(searchLower) ||
      report.location?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower) ||
      report.status?.toLowerCase().includes(searchLower);

    const matchesFormType = !filters.formType || report.form_type === filters.formType;
    const matchesType = !filters.type || report.type === filters.type;
    const matchesPriority = !filters.priority || report.priority === filters.priority;
    const matchesStatus = !filters.status || report.status === filters.status;

    let matchesDateFrom = true;
    let matchesDateTo = true;
    if (filters.dateFrom) {
      const reportDate = new Date(report.created_at);
      const fromDate = new Date(filters.dateFrom);
      matchesDateFrom = reportDate >= fromDate;
    }
    if (filters.dateTo) {
      const reportDate = new Date(report.created_at);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      matchesDateTo = reportDate <= toDate;
    }

    return matchesSearch && matchesFormType && matchesType && matchesPriority && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredReports.map((report) => ({
      'ID': report.id,
      'Type': report.type,
      'Priority': report.priority,
      'Status': report.status,
      'Location': report.location,
      'Sub-Location': report.sub_location,
      'Specific Room': report.specific_room,
      'Incident Date': report.incident_datetime || 'N/A',
      'Description': report.description,
      'Actions Taken': report.actions_taken || 'N/A',
      'Immediate Actions': report.immediate_actions || 'N/A',
      'Observer Name': report.observer_name || 'Anonymous',
      'Observer Email': report.observer_email || 'N/A',
      'Assigned To': report.assigned_to || 'Unassigned',
      'Created At': formatDate(report.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Safety Reports');

    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r.Description?.length || 0), 10);
    ws['!cols'] = [
      { wch: 5 },  // ID
      { wch: 20 }, // Type
      { wch: 10 }, // Priority
      { wch: 12 }, // Status
      { wch: 15 }, // Location
      { wch: 20 }, // Sub-Location
      { wch: 20 }, // Specific Room
      { wch: 20 }, // Incident Date
      { wch: Math.min(maxWidth, 50) }, // Description
      { wch: 30 }, // Actions Taken
      { wch: 30 }, // Immediate Actions
      { wch: 20 }, // Observer Name
      { wch: 25 }, // Observer Email
      { wch: 20 }, // Assigned To
      { wch: 20 }, // Created At
    ];

    XLSX.writeFile(wb, `safety-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape mode

    // Add title
    doc.setFontSize(18);
    doc.text('Nucleus Safety Reports', 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Reports: ${filteredReports.length}`, 14, 27);

    // Prepare table data
    const tableData = filteredReports.map((report) => [
      report.id,
      report.type,
      report.priority,
      report.status,
      `${report.location} › ${report.sub_location}`,
      report.description?.substring(0, 100) + (report.description?.length > 100 ? '...' : ''),
      report.observer_name || 'Anonymous',
      formatDate(report.created_at),
    ]);

    // Add table
    doc.autoTable({
      startY: 32,
      head: [['ID', 'Type', 'Priority', 'Status', 'Location', 'Description', 'Reporter', 'Date']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10 },  // ID
        1: { cellWidth: 25 },  // Type
        2: { cellWidth: 15 },  // Priority
        3: { cellWidth: 20 },  // Status
        4: { cellWidth: 40 },  // Location
        5: { cellWidth: 70 },  // Description
        6: { cellWidth: 30 },  // Reporter
        7: { cellWidth: 30 },  // Date
      },
      margin: { top: 32 },
    });

    doc.save(`safety-reports-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF file downloaded successfully');
  };

  if (isLoading) return <LoadingScreen message="Loading reports..." />;
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Failed to load reports</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">View Reports</h1>

        <div className="flex flex-col gap-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {/* Export Buttons */}
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={filteredReports.length === 0}
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={filteredReports.length === 0}
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>

            {/* Delete All */}
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              disabled={reports.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select
                  value={filters.formType}
                  onChange={(e) => setFilters({ ...filters, formType: e.target.value })}
                  options={[
                    { value: '', label: 'All Form Types' },
                    ...FORM_TYPES.map(ft => ({ value: ft.value, label: ft.label }))
                  ]}
                />
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  options={[{ value: '', label: 'All Types' }, ...REPORT_TYPES.filter(t => t.value)]}
                />
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  options={[{ value: '', label: 'All Priorities' }, ...PRIORITY_LEVELS]}
                />
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={[{ value: '', label: 'All Statuses' }, ...STATUS_TYPES]}
                />
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  placeholder="From Date"
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  placeholder="To Date"
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-gray-600 text-sm">Total Reports</p>
          <p className="text-3xl font-bold text-gray-900">{filteredReports.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-600 text-sm">Open</p>
          <p className="text-3xl font-bold text-red-600">
            {filteredReports.filter((r) => r.status === 'Open').length}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">
            {filteredReports.filter((r) => r.status === 'In Progress').length}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-600 text-sm">Resolved</p>
          <p className="text-3xl font-bold text-green-600">
            {filteredReports.filter((r) => r.status === 'Resolved').length}
          </p>
        </Card>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || Object.values(filters).some(v => v) ? 'No reports match your search or filters' : 'No reports submitted yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className={`${selectedReport?.id === report.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Report Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() =>
                  setSelectedReport(selectedReport?.id === report.id ? null : report)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-gray-900">{report.type}</h3>
                    {report.form_type && (
                      <Badge variant="info">
                        {FORM_TYPES.find(ft => ft.value === report.form_type)?.label || report.form_type}
                      </Badge>
                    )}
                    <Badge variant={STATUS_COLORS[report.status]}>{report.status}</Badge>
                    <Badge variant={PRIORITY_COLORS[report.priority]}>{report.priority}</Badge>
                  </div>

                  <p className="text-gray-600 mb-2">
                    {report.location} › {report.sub_location} › {report.specific_room}
                  </p>

                  <p className="text-gray-700 line-clamp-2">{report.description}</p>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{formatDate(report.created_at)}</span>
                    {report.comment_count > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {report.comment_count}
                      </span>
                    )}
                    {report.assigned_to && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {report.assigned_to}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {selectedReport?.id === report.id ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedReport?.id === report.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                  {/* Full Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{report.description}</p>
                    </div>

                    {report.incident_datetime && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Incident Date/Time</h4>
                        <p className="text-gray-700">{new Date(report.incident_datetime).toLocaleString()}</p>
                      </div>
                    )}

                    {report.immediate_actions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Immediate Actions</h4>
                        <p className="text-gray-700">{report.immediate_actions}</p>
                      </div>
                    )}

                    {report.actions_taken && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Additional Actions</h4>
                        <p className="text-gray-700">{report.actions_taken}</p>
                      </div>
                    )}

                    {report.observer_name && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Reported By</h4>
                        <p className="text-gray-700">{report.observer_name}</p>
                        {report.observer_email && (
                          <p className="text-gray-600 text-sm">{report.observer_email}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Photo */}
                  {report.photo && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Photo Evidence</h4>
                      <img
                        src={report.photo}
                        alt="Evidence"
                        className="max-w-md rounded-lg border border-gray-300"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      options={STATUS_TYPES}
                      className="w-auto"
                    />
                    <Button variant="outline" onClick={() => handleAssign(report.id)}>
                      <User className="w-4 h-4" />
                      {report.assigned_to ? 'Reassign' : 'Assign'}
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteSingle(report.id)}>
                      <Trash2 className="w-4 h-4" />
                      Delete Report
                    </Button>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Comments ({comments.length})
                    </h4>

                    {/* Comments List */}
                    <div className="space-y-3 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{comment.user_name}</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.comment_text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="space-y-3">
                      <Input
                        placeholder="Your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment}>
                        <MessageSquare className="w-4 h-4" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        title={deleteTarget === 'all' ? 'Delete All Reports' : 'Delete Report'}
      >
        <p className="text-gray-700 mb-6">
          {deleteTarget === 'all'
            ? `Are you sure you want to delete all ${reports.length} reports? This action cannot be undone.`
            : 'Are you sure you want to delete this report? This action cannot be undone.'}
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteTarget(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {deleteTarget === 'all' ? 'Delete All' : 'Delete Report'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
