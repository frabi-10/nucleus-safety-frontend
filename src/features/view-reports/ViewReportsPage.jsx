import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, MessageSquare, User } from 'lucide-react';
import { useReports, useDeleteAllReports, useUpdateReportStatus, useAssignReport } from '@hooks/useReports';
import { useComments, useAddComment } from '@hooks/useComments';
import { Button, Card, Badge, Input, Select, Textarea, Modal, LoadingScreen } from '@components/ui';
import { STATUS_TYPES, STATUS_COLORS, PRIORITY_COLORS } from '@utils/constants';
import { formatDate } from '@utils/helpers';

export const ViewReportsPage = ({ toast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState('');

  const { data: reports = [], isLoading, error, refetch } = useReports();
  const { mutate: deleteAll } = useDeleteAllReports();
  const { mutate: updateStatus } = useUpdateReportStatus();
  const { mutate: assignReport } = useAssignReport();
  const { mutate: addComment } = useAddComment();

  // Get comments for selected report
  const { data: comments = [] } = useComments(selectedReport?.id);

  const handleDeleteAll = () => {
    deleteAll(undefined, {
      onSuccess: () => {
        toast.success('All reports deleted successfully');
        setShowDeleteConfirm(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete reports');
      },
    });
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

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.type?.toLowerCase().includes(searchLower) ||
      report.location?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower) ||
      report.status?.toLowerCase().includes(searchLower)
    );
  });

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

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Delete All */}
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={reports.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-gray-600 text-sm">Total Reports</p>
          <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-600 text-sm">Open</p>
          <p className="text-3xl font-bold text-red-600">
            {reports.filter((r) => r.status === 'Open').length}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">
            {reports.filter((r) => r.status === 'In Progress').length}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-600 text-sm">Resolved</p>
          <p className="text-3xl font-bold text-green-600">
            {reports.filter((r) => r.status === 'Resolved').length}
          </p>
        </Card>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No reports match your search' : 'No reports submitted yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className={`${selectedReport?.id === report.id ? 'ring-2 ring-purple-500' : ''}`}
            >
              {/* Report Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() =>
                  setSelectedReport(selectedReport?.id === report.id ? null : report)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{report.type}</h3>
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

                    {report.actions_taken && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Actions Taken</h4>
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
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete All Reports"
      >
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete all {reports.length} reports? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAll}>
            Delete All
          </Button>
        </div>
      </Modal>
    </div>
  );
};
