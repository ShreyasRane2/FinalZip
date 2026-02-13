import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    jobType: 'FULL_TIME',
    workMode: 'OFFICE'
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getAllJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await jobAPI.createJob(formData);
      alert('Job created successfully!');
      setShowCreateForm(false);
      loadJobs();
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        jobType: 'FULL_TIME',
        workMode: 'OFFICE'
      });
    } catch (error) {
      alert('Error creating job: ' + (error.response?.data || error.message));
    }
  };

  if (loading) return <div className="loading">Loading jobs...</div>;

  return (
    <div className="container">
      <div className="jobs-header">
        <h1 className="page-title">Available Jobs</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Post a Job'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h3>Create New Job</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Salary</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Work Mode</label>
              <select name="workMode" value={formData.workMode} onChange={handleChange}>
                <option value="OFFICE">Office</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success">Create Job</button>
          </form>
        </div>
      )}

      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <p>No jobs available</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p className="job-location">📍 {job.location}</p>
              <p className="job-type">{job.jobType} • {job.workMode}</p>
              {job.salary && <p className="job-salary">💰 {job.salary}</p>}
              <p className="job-description">{job.description?.substring(0, 150)}...</p>
              <Link to={`/jobs/${job.id}`} className="btn btn-primary">View Details</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
