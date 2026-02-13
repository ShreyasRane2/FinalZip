import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await applicationAPI.getUserApplications(1); // Replace with actual user ID
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className="container">
      <h1 className="page-title">My Applications</h1>

      {applications.length === 0 ? (
        <div className="card">
          <p>You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="grid">
          {applications.map((app) => (
            <div key={app.id} className="card">
              <h3>Application #{app.id}</h3>
              <p><strong>Job ID:</strong> {app.jobId}</p>
              <p><strong>Status:</strong> <span className={`status-${app.status?.toLowerCase()}`}>{app.status}</span></p>
              <p><strong>Applied:</strong> {new Date(app.appliedDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
