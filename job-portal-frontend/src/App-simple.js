import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5454/api/auth/login', { email, password });
      const { jwt } = response.data;
      setToken(jwt);
      localStorage.setItem('token', jwt);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5454/api/auth/register', userData);
      return { success: true, message: response.data };
    } catch (error) {
      console.error('Registration error:', error.response);
      const errorMessage = error.response?.data || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// Private Route
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Navbar
function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  // Fetch user role directly if user object is not available
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isAuthenticated && !user) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserRole(response.data.role);
          console.log('Navbar: Fetched role directly:', response.data.role);
        } catch (error) {
          console.error('Navbar: Failed to fetch role:', error);
        }
      } else if (user) {
        setUserRole(user.role);
      }
    };
    fetchUserRole();
  }, [isAuthenticated, user]);

  // Debug logging
  console.log('Navbar - isAuthenticated:', isAuthenticated);
  console.log('Navbar - user:', user);
  console.log('Navbar - user.role:', user?.role);
  console.log('Navbar - userRole (direct fetch):', userRole);
  console.log('Navbar - is employer:', (user?.role || userRole) === 'ROLE_EMPLOYER');

  const isEmployer = (user?.role || userRole) === 'ROLE_EMPLOYER';

  return (
    <nav style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 0', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>💼</span> Job Portal
        </Link>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Dashboard</Link>
              {isEmployer ? (
                <Link to="/post-job" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Add Job</Link>
              ) : (
                <Link to="/jobs" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Jobs</Link>
              )}
              <Link to="/applications" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Applications</Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Profile</Link>
              <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Login</Link>
              <Link to="/register" style={{ background: 'white', color: '#667eea', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Login Page
function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

// Register Page
function Register() {
  const [formData, setFormData] = useState({ emailId: '', password: '', fullName: '', role: 'ROLE_EMPLOYEE' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={formData.emailId}
            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="ROLE_EMPLOYEE">Job Seeker</option>
            <option value="ROLE_EMPLOYER">Employer</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, applications: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch total jobs count
      const jobsResponse = await axios.get('http://localhost:8082/api/jobs/');
      const totalJobs = jobsResponse.data.length;
      
      // Fetch user's applications if user is logged in
      let applications = 0;
      let interviews = 0;
      
      if (user) {
        try {
          const appsResponse = await axios.get(`http://localhost:8087/applications/user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          applications = appsResponse.data.length;
          
          // Count interviews (applications with INTERVIEW_SCHEDULED status)
          interviews = appsResponse.data.filter(app => 
            app.status === 'INTERVIEW_SCHEDULED'
          ).length;
        } catch (error) {
          console.log('Could not fetch applications:', error);
        }
      }
      
      setStats({ totalJobs, applications, interviews });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({ totalJobs: 0, applications: 0, interviews: 0 });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h1 style={{ marginBottom: '10px' }}>Welcome to Your Dashboard</h1>
          <p style={{ color: '#666' }}>Manage your job search and applications</p>
        </div>
        <button onClick={fetchDashboardStats} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px', marginTop: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.totalJobs}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Available Jobs</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.applications}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>My Applications</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.interviews}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Interviews Scheduled</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {user?.role === 'ROLE_EMPLOYER' ? (
          // Employer Quick Actions
          [
            { to: '/post-job', icon: '➕', title: 'Add Job', desc: 'Post a new job opening', color: '#667eea' },
            { to: '/profile', icon: '👤', title: 'My Profile', desc: 'Update your information', color: '#28a745' },
            { to: '/applications', icon: '📝', title: 'Applications', desc: 'View job applications', color: '#ffc107' }
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ color: item.color, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </Link>
          ))
        ) : (
          // Job Seeker Quick Actions
          [
            { to: '/jobs', icon: '💼', title: 'Browse Jobs', desc: 'Find your dream job', color: '#007bff' },
            { to: '/profile', icon: '👤', title: 'My Profile', desc: 'Update your information', color: '#28a745' },
            { to: '/applications', icon: '📝', title: 'Applications', desc: 'Track your applications', color: '#ffc107' },
            { to: '/resume', icon: '📄', title: 'Resume', desc: 'Manage your resume', color: '#17a2b8' }
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ color: item.color, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// Profile Page
function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', emailId: '', skills: [] });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        emailId: response.data.emailId || '',
        skills: response.data.skills || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5454/api/users/me', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '⚠️ WARNING: This will permanently delete your account and all associated data.\n\n' +
      'This includes:\n' +
      '- Your profile information\n' +
      '- All job applications\n' +
      '- Your resume\n' +
      '- All saved data\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure you want to delete your account?'
    );

    if (!confirmDelete) return;

    const doubleConfirm = window.confirm(
      'This is your last chance!\n\n' +
      'Type your email to confirm: ' + user.emailId + '\n\n' +
      'Click OK to permanently delete your account.'
    );

    if (!doubleConfirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Your account has been permanently deleted.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Failed to load profile</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h1>My Profile</h1>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        {!editing ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Full Name</h3>
              <p style={{ fontSize: '18px' }}>{user.fullName}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Email</h3>
              <p style={{ fontSize: '18px' }}>{user.emailId}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Role</h3>
              <p style={{ fontSize: '18px' }}>{user.role === 'ROLE_EMPLOYEE' ? 'Job Seeker' : 'Employer'}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, i) => (
                    <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: '15px', fontSize: '14px' }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ color: '#999' }}>No skills added yet</p>
                )}
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Edit Profile
            </button>
            <button 
              onClick={handleDeleteAccount} 
              style={{ 
                padding: '10px 20px', 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Delete Account
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email (Read-only)</label>
              <input type="email" value={formData.emailId} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Skills</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g., Java, React)" 
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                />
                <button onClick={addSkill} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {formData.skills.map((skill, i) => (
                  <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {skill}
                    <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '16px', padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Save Changes
              </button>
              <button onClick={() => { setEditing(false); setFormData({ fullName: user.fullName, emailId: user.emailId, skills: user.skills || [] }); }} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Jobs Page - REAL DATA from Job Service
function Jobs() {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
    };
    fetchCurrentUser();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Try simple endpoint first (no company service dependency)
      const response = await axios.get('http://localhost:8082/api/jobs/simple');
      console.log('Jobs fetched:', response.data);
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Make sure Job Service is running on port 8082.');
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    // Use currentUser instead of user from context
    if (!currentUser && !isAuthenticated) {
      alert('Please login to apply for jobs');
      return;
    }

    if (currentUser?.role === 'ROLE_EMPLOYER') {
      alert('Employers cannot apply for jobs');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Get user ID - either from context or fetch from API
      let userId = currentUser?.id;
      
      if (!userId) {
        console.log('User not in context, fetching from API...');
        const userResponse = await axios.get('http://localhost:5454/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        userId = userResponse.data.id;
      }
      
      console.log('Applying for job with userId:', userId, 'jobId:', jobId);
      
      await axios.post('http://localhost:8087/applications', {
        applicantId: userId,  // Backend expects applicantId, not userId
        jobId: jobId,
        applicationStatus: 'Applied'  // Backend expects applicationStatus, not status
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application. You may have already applied for this job.');
    }
  };

  const filteredJobs = jobs.filter(job => 
    (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading jobs...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchJobs} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Browse Jobs ({jobs.length} available)</h1>
        <button onClick={fetchJobs} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px' }}>
          <h2>No Jobs Available</h2>
          <p style={{ color: '#666' }}>There are currently no job postings. Check back later!</p>
          {user?.role === 'ROLE_EMPLOYER' && (
            <Link to="/post-job" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredJobs.map(job => (
            <div key={job.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{job.title}</h2>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '16px' }}>🏢 {job.companyName || 'Company'}</p>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '16px' }}>📍 {job.location || 'Location not specified'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '5px 12px', borderRadius: '20px', fontSize: '14px' }}>
                    {job.jobType || 'Full-time'}
                  </span>
                  {job.salaryRange && (
                    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#28a745', fontSize: '18px' }}>{job.salaryRange}</p>
                  )}
                </div>
              </div>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                {job.description || 'No description available'}
              </p>
              {user?.role !== 'ROLE_EMPLOYER' && (
                <button 
                  onClick={() => handleApply(job.id)}
                  style={{ padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                >
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredJobs.length === 0 && jobs.length > 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p style={{ fontSize: '18px' }}>No jobs found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

// Applications Page
function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  const fetchJobsAndApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First, fetch all jobs
      const jobsResponse = await axios.get('http://localhost:8082/api/jobs/simple');
      const jobsData = jobsResponse.data;
      setJobs(jobsData);
      console.log('Jobs fetched:', jobsData);
      
      // Get user ID - either from context or fetch from API
      let userId = user?.id;
      
      if (!userId) {
        console.log('User not in context, fetching from API...');
        try {
          const userResponse = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          userId = userResponse.data.id;
          console.log('Fetched user ID:', userId);
        } catch (err) {
          console.error('Error fetching user:', err);
          setError('Failed to load user data');
          setLoading(false);
          return;
        }
      }
      
      const response = await axios.get(`http://localhost:8087/applications/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Applications fetched:', response.data);
      
      // Ensure we have an array
      const applicationsData = Array.isArray(response.data) ? response.data : [];
      
      // Match applications with job details
      const applicationsWithJobDetails = applicationsData.map(app => {
        const job = jobsData.find(j => j.id === app.jobId);
        return {
          ...app,
          jobTitle: job?.title || `Job #${app.jobId}`,
          companyName: job?.companyName || 'Unknown Company',
          location: job?.location,
          jobType: job?.jobType
        };
      });
      
      console.log('Applications with job details:', applicationsWithJobDetails);
      setApplications(applicationsWithJobDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    const colors = {
      'APPLIED': '#17a2b8',
      'PENDING': '#ffc107',
      'UNDER_REVIEW': '#17a2b8',
      'UNDER REVIEW': '#17a2b8',
      'INTERVIEW_SCHEDULED': '#17a2b8',
      'INTERVIEW SCHEDULED': '#17a2b8',
      'ACCEPTED': '#28a745',
      'REJECTED': '#dc3545'
    };
    return colors[statusUpper] || '#6c757d';
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading applications...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchJobsAndApplications} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>My Applications</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>Track the status of your job applications ({applications.length} total)</p>
        </div>
        <button onClick={fetchJobsAndApplications} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px' }}>
          <h2>No Applications Yet</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" style={{ display: 'inline-block', padding: '10px 20px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {applications.map(app => (
            <div key={app.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>{app.jobTitle || `Job ID: ${app.jobId}`}</h2>
                  <div style={{ display: 'flex', gap: '20px', margin: '10px 0', color: '#666' }}>
                    {app.companyName && <p style={{ margin: 0 }}>🏢 {app.companyName}</p>}
                    {app.location && <p style={{ margin: 0 }}>📍 {app.location}</p>}
                    {app.jobType && <p style={{ margin: 0 }}>💼 {app.jobType}</p>}
                  </div>
                  <p style={{ margin: '5px 0', color: '#666' }}>📅 Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                  {app.coverLetter && (
                    <p style={{ margin: '15px 0 0 0', color: '#666', fontStyle: 'italic' }}>"{app.coverLetter}"</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: getStatusColor(app.applicationStatus), color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block' }}>
                    {formatStatus(app.applicationStatus)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Resume Page
function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    file: null,
    skills: '',
    experience: 0
  });

  useEffect(() => {
    fetchUserAndResumes();
  }, []);

  const fetchUserAndResumes = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login.');
        setLoading(false);
        return;
      }

      console.log('Fetching user data...');
      // Fetch user email
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User response:', userResponse.data);
      
      if (!userResponse.data || !userResponse.data.emailId) {
        setError('User email not found in response. Please try logging in again.');
        setLoading(false);
        return;
      }

      const email = userResponse.data.emailId;
      setUserEmail(email);
      console.log('User email:', email);
      
      // Fetch resumes
      console.log('Fetching resumes for:', email);
      const response = await axios.get(`http://localhost:8090/resume?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Resumes response:', response.data);
      setResumes(response.data);
    } catch (error) {
      console.error('Error in fetchUserAndResumes:', error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response from server. Please check if services are running.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Please select a file');
      return;
    }

    if (!userEmail) {
      alert('User email not loaded. Please refresh the page.');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('email', userEmail);
      uploadData.append('skills', formData.skills);
      uploadData.append('experience', formData.experience);

      await axios.post('http://localhost:8090/resume/upload', uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Resume uploaded successfully!');
      setShowUploadForm(false);
      setFormData({ file: null, skills: '', experience: 0 });
      fetchUserAndResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    if (!userEmail) {
      alert('User email not loaded. Please refresh the page.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8090/resume/${resumeId}?email=${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Resume deleted successfully!');
      fetchUserAndResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  if (error) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#856404', marginTop: 0 }}>⚠️ Error Loading Resume Page</h2>
          <p style={{ color: '#856404', marginBottom: '15px' }}>{error}</p>
          <button 
            onClick={fetchUserAndResumes}
            style={{ padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            Retry
          </button>
        </div>
        <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Troubleshooting:</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>Make sure you're logged in</li>
            <li>Check if User Service is running on port 5454</li>
            <li>Check if Resume Service is running on port 8090</li>
            <li>Open browser console (F12) for detailed error messages</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Resume</h1>
        {resumes.length === 0 && (
          <button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{ padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            {showUploadForm ? 'Cancel' : 'Upload Resume'}
          </button>
        )}
      </div>

      {userEmail && (
        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px', color: '#155724' }}>
          ✓ Logged in as: {userEmail}
        </div>
      )}

      {showUploadForm && resumes.length === 0 && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Upload Resume</h2>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Resume File (PDF/DOC)</label>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Skills (comma separated)</label>
              <input 
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., Java, React, Spring Boot, MySQL"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Years of Experience</label>
              <input 
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                min="0"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={uploading}
              style={{ padding: '10px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>
      )}

      {resumes.length === 0 && !showUploadForm ? (
        <div style={{ background: 'white', padding: '50px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>No resume uploaded yet.</p>
          <p style={{ color: '#999' }}>Click "Upload Resume" to add your resume.</p>
        </div>
      ) : resumes.length > 0 ? (
        <div>
          {resumes.map((resume) => (
            <div key={resume.id} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#667eea' }}>{resume.fileName}</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#333' }}>Experience:</strong>
                    <span style={{ marginLeft: '10px', color: '#666' }}>{resume.experience} years</span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#333', display: 'block', marginBottom: '8px' }}>Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {resume.skills.split(',').map((skill, i) => (
                        <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: '15px', fontSize: '14px' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                  <button 
                    onClick={() => handleDelete(resume.id)}
                    style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
            <p style={{ margin: 0, color: '#856404' }}>
              ℹ️ You can only have one resume. Delete the current resume to upload a new one.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Post Job Page (For Employers)
function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minSalary: '',
    maxSalary: '',
    location: '',
    experience: '',
    jobType: 'FULL_TIME',
    workMode: 'WORK_FROM_OFFICE',
    status: 'OPEN',
    keySkills: []
  });
  const [newSkill, setNewSkill] = useState('');

  // Redirect if not employer
  useEffect(() => {
    if (user && user.role !== 'ROLE_EMPLOYER') {
      alert('Only employers can post jobs');
      navigate('/jobs');
    }
  }, [user, navigate]);

  const addSkill = () => {
    if (newSkill.trim() && !formData.keySkills.includes(newSkill.trim())) {
      setFormData({ ...formData, keySkills: [...formData.keySkills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, keySkills: formData.keySkills.filter(s => s !== skillToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // For now, using a default companyId of 1
      // In production, this should come from the employer's profile
      const companyId = 1;
      
      const jobData = {
        title: formData.title,
        description: formData.description,
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        location: formData.location,
        experience: parseInt(formData.experience) || 0,
        jobType: formData.jobType,
        workMode: formData.workMode,
        status: formData.status,
        keySkills: formData.keySkills,
        companyId: companyId
      };

      await axios.post(`http://localhost:8082/api/admin/jobs?companyId=${companyId}`, jobData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Job posted successfully!');
      navigate('/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h1>Add Job</h1>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Job Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Java Developer"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Description <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the job role, responsibilities, and requirements..."
              required
              rows="6"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Location <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Mumbai, India"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Salary Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Min Salary
              </label>
              <input
                type="text"
                value={formData.minSalary}
                onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                placeholder="e.g., 50000"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Max Salary
              </label>
              <input
                type="text"
                value={formData.maxSalary}
                onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                placeholder="e.g., 80000"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Experience Required (years)
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 3"
              min="0"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Job Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Type
            </label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Work Mode */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Work Mode
            </label>
            <select
              value={formData.workMode}
              onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            >
              <option value="WORK_FROM_OFFICE">Work From Office</option>
              <option value="HYBRID">Hybrid</option>
              <option value="WORK_FROM_HOME">Work From Home</option>
            </select>
          </div>

          {/* Key Skills */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Required Skills
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., Java, React)"
                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={addSkill}
                style={{ padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {formData.keySkills.map((skill, i) => (
                <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '18px', padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 32px', background: loading ? '#ccc' : '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              {loading ? 'Adding...' : 'Add Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              style={{ padding: '12px 32px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
            <Route path="/resume" element={<PrivateRoute><Resume /></PrivateRoute>} />
            <Route path="/post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
