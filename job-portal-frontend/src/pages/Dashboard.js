import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-grid">
        <Link to="/jobs" className="dashboard-card">
          <div className="card-icon">💼</div>
          <h3>Browse Jobs</h3>
          <p>Find your dream job from thousands of listings</p>
        </Link>

        <Link to="/applications" className="dashboard-card">
          <div className="card-icon">📝</div>
          <h3>My Applications</h3>
          <p>Track your job applications</p>
        </Link>

        <Link to="/profile" className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Profile</h3>
          <p>Manage your professional profile</p>
        </Link>

        <Link to="/resume" className="dashboard-card">
          <div className="card-icon">📄</div>
          <h3>Resume</h3>
          <p>Upload and manage your resume</p>
        </Link>

        <Link to="/notifications" className="dashboard-card">
          <div className="card-icon">🔔</div>
          <h3>Notifications</h3>
          <p>View your notifications</p>
        </Link>

        <Link to="/company" className="dashboard-card">
          <div className="card-icon">🏢</div>
          <h3>Company</h3>
          <p>Manage company profile</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
