import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await adminAPI.getAllJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
    setLoading(false);
  };

  const approveJob = async (jobId) => {
    try {
      await adminAPI.approveJob(jobId);
      alert('Job approved successfully!');
      loadJobs();
    } catch (error) {
      alert('Error approving job: ' + (error.response?.data || error.message));
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="card">
        <h3>Job Management</h3>
        <p>Total Jobs: {jobs.length}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        {jobs.length === 0 ? (
          <div className="card">
            <p>No jobs to manage</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4>{job.title}</h4>
                  <p>{job.location} • {job.jobType}</p>
                  <p><strong>Status:</strong> {job.status}</p>
                </div>
                {job.status !== 'APPROVED' && (
                  <button 
                    onClick={() => approveJob(job.id)} 
                    className="btn btn-success"
                  >
                    Approve Job
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
