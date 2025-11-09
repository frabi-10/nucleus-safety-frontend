import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { useReports } from '@hooks/useReports';
import { Card, Badge, LoadingScreen } from '@components/ui';
import { STATUS_COLORS, PRIORITY_COLORS } from '@utils/constants';
import { formatShortDate } from '@utils/helpers';

export const AssignedReportsPage = () => {
  const navigate = useNavigate();
  const { data: reports = [], isLoading, error } = useReports();

  // Filter only assigned reports
  const assignedReports = reports.filter((report) => report.assigned_to);

  if (isLoading) return <LoadingScreen message="Loading assigned reports..." />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load assigned reports</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Assigned Reports</h1>

      {assignedReports.length === 0 ? (
        <Card className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No reports have been assigned yet</p>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <p className="text-gray-600 text-sm">Total Assigned</p>
              <p className="text-3xl font-bold text-gray-900">{assignedReports.length}</p>
            </Card>
            <Card className="text-center">
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">
                {assignedReports.filter((r) => r.status === 'In Progress').length}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {assignedReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length}
              </p>
            </Card>
          </div>

          {/* Assigned Reports Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Assigned To</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Assigned By</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Priority</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedReports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => navigate('/view')}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{report.type}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {report.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700">
                          <p>{report.location}</p>
                          <p className="text-gray-500">
                            {report.sub_location} › {report.specific_room}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{report.assigned_to}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700">{report.assigned_by || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={PRIORITY_COLORS[report.priority]}>
                          {report.priority}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={STATUS_COLORS[report.status]}>{report.status}</Badge>
                      </td>
                      <td className="p-4">
                        {report.due_date ? (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatShortDate(report.due_date)}
                          </div>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Group by Assignee */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">By Assignee</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                assignedReports.reduce((acc, report) => {
                  const assignee = report.assigned_to;
                  if (!acc[assignee]) acc[assignee] = [];
                  acc[assignee].push(report);
                  return acc;
                }, {})
              ).map(([assignee, reports]) => (
                <Card key={assignee}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignee}</h3>
                      <p className="text-sm text-gray-600">{reports.length} report(s)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate('/view')}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {report.type}
                          </span>
                          <Badge variant={STATUS_COLORS[report.status]} className="text-xs">
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {report.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
