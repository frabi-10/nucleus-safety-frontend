import React from 'react';

function ReportsList({ reports, onStatusUpdate }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      'Near Miss': '#FFA500',
      'Safety Hazard': '#FF6347',
      'Unsafe Condition': '#FF4500',
      'Unsafe Act': '#DC143C',
      'Incident': '#8B0000'
    };
    return colors[type] || '#666';
  };

  if (reports.length === 0) {
    return (
      <div className="no-reports">
        <p>No safety reports yet. Click "New Safety Report" to submit one.</p>
      </div>
    );
  }

  return (
    <div className="reports-list">
      <h2>Recent Reports</h2>
      {reports.map(report => (
        <div key={report.id} className="report-card">
          <div className="report-header">
            <span 
              className="report-type" 
              style={{ backgroundColor: getTypeColor(report.type) }}
            >
              {report.type}
            </span>
            <span className={`report-status ${report.status.toLowerCase()}`}>
              {report.status}
            </span>
          </div>
          
          <div className="report-body">
            <div className="report-info">
              <strong>Location:</strong> {report.location}
              {report.sub_location && ` - ${report.sub_location}`}
            </div>
            <div className="report-info">
              <strong>Date:</strong> {formatDate(report.created_at)}
            </div>
            <div className="report-description">
              <strong>Description:</strong> {report.description}
            </div>
            {report.actions_taken && (
              <div className="report-actions">
                <strong>Actions Taken:</strong> {report.actions_taken}
              </div>
            )}
            {report.observer_name && (
              <div className="report-observer">
                <strong>Reported by:</strong> {report.observer_name}
              </div>
            )}
          </div>
          
          <div className="report-footer">
            {report.status === 'Open' ? (
              <button 
                onClick={() => onStatusUpdate(report.id, 'Closed')}
                className="status-btn close-btn"
              >
                Mark as Closed
              </button>
            ) : (
              <button 
                onClick={() => onStatusUpdate(report.id, 'Open')}
                className="status-btn reopen-btn"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReportsList;