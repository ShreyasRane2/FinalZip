import React, { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profileType, setProfileType] = useState('employee');
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    companyName: '',
    industry: '',
    location: '',
    skills: '',
    experience: '',
    education: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, [profileType]);

  const loadProfile = async () => {
    if (!user?.email) return;
    
    try {
      const response = profileType === 'employer' 
        ? await profileAPI.getEmployerProfile(user.email)
        : await profileAPI.getEmployeeProfile(user.email);
      setProfile(response.data);
    } catch (error) {
      console.log('Profile not found');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (profileType === 'employer') {
        await profileAPI.createEmployerProfile(formData);
      } else {
        await profileAPI.createEmployeeProfile(formData);
      }
      setMessage('Profile created successfully!');
      loadProfile();
    } catch (error) {
      setMessage('Error creating profile: ' + (error.response?.data || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="page-title">Profile Management</h1>

      <div className="form-group">
        <label>Profile Type</label>
        <select value={profileType} onChange={(e) => setProfileType(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="employer">Employer</option>
        </select>
      </div>

      {profile ? (
        <div className="card">
          <h3>Your {profileType} Profile</h3>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {profileType === 'employer' ? (
            <>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Java, React, Node.js"
                />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {message && <div className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
