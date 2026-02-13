import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await jobAPI.getJobById(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error loading job:', error);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationAPI.applyForJob({
        jobId: id,
        userId: 1 // Replace with actual user ID
      });
      alert('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      alert('Error applying: ' + (error.response?.data || error.message));
    }
    setApplying(false);
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="container">Job not found</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/jobs')} className="btn">← Back to Jobs</button>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h1>{job.title}</h1>
        <p className="job-location">📍 {job.location}</p>
        <p className="job-type">{job.jobType} • {job.workMode}</p>
        {job.salary && <p className="job-salary">💰 {job.salary}</p>}
        
        <hr style={{ margin: '20px 0' }} />
        
        <h3>Job Description</h3>
        <p style={{ lineHeight: '1.8', color: '#555' }}>{job.description}</p>
        
        <button 
          onClick={handleApply} 
          className="btn btn-success" 
          disabled={applying}
          style={{ marginTop: '20px' }}
        >
          {applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
