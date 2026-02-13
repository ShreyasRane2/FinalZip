import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Resume = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    if (!user?.email) return;
    
    try {
      const response = await resumeAPI.getResume(user.email);
      setResume(response.data);
    } catch (error) {
      console.log('No resume found');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', user?.email || '');

    try {
      await resumeAPI.uploadResume(formData);
      setMessage('Resume uploaded successfully!');
      loadResume();
      setFile(null);
    } catch (error) {
      setMessage('Error uploading resume: ' + (error.response?.data || error.message));
    }
    setUploading(false);
  };

  return (
    <div className="container">
      <h1 className="page-title">Resume Management</h1>

      {resume ? (
        <div className="card">
          <h3>Your Resume</h3>
          <p><strong>File Name:</strong> {resume.fileName}</p>
          <p><strong>Uploaded:</strong> {new Date(resume.uploadDate).toLocaleDateString()}</p>
          <button className="btn btn-primary">Download Resume</button>
        </div>
      ) : (
        <div className="card">
          <p>No resume uploaded yet</p>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Upload New Resume</h3>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Select Resume File (PDF, DOC, DOCX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
            />
          </div>

          {message && (
            <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-success" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Resume;
