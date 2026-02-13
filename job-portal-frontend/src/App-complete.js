import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API Base URLs
const USER_API = 'http://localhost:5454';
const JOB_API = 'http://localhost:8082';
const APPLICATION_API = 'http://localhost:8087';

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${USER_API}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${USER_API}/api/auth/login`, { email, password });
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
      const response = await axios.post(`${USER_API}/api/auth/register`, userData);
      return { success: true, message: response.data };
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token, refreshUser: fetchCurrentUser }}>
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
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 0', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>💼</span> Job Portal
        </Link>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Dashboard</Link>
              {user?.role === 'ROLE_EMPLOYER' ? (
                <>
                  <Link to="/post-job" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Post Job</Link>
                  <Link to="/my-jobs" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>My Jobs</Link>
                </>
              ) : (
                <>
                  <Link to="/jobs" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Jobs</Link>
                  <Link to="/applications" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Applications</Link>
                </>
              )}
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Profile</Link>
              <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '16px' }}>
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
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>Don't have an account? <Link to="/register">Register here</Link></p>
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
          <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input type="email" value={formData.emailId} onChange={(e) => setFormData({ ...formData, emailId: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>I am a</label>
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <option value="ROLE_EMPLOYEE">Job Seeker</option>
            <option value="ROLE_EMPLOYER">Employer</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

// Dashboard - Role Based
function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, myApplications: 0, myJobs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch total jobs
      const jobsResponse = await axios.get(`${JOB_API}/api/jobs/`);
      const totalJobs = jobsResponse.data.length;

      let myApplications = 0;
      let myJobs = 0;

      if (user) {
        if (user.role === 'ROLE_EMPLOYEE') {
          // Fetch user's applications
          try {
            const appsResponse = await axios.get(`${APPLICATION_API}/applications/user/${user.id}`);
            myApplications = appsResponse.data.length;
          } catch (error) {
            console.log('No applications yet');
          }
        } else {
          // For employers, count their posted jobs
          // Note: You'll need to add companyId to user or fetch differently
          myJobs = 0; // Placeholder
        }
      }

      setStats({ totalJobs, myApplications, myJobs });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <h1>Welcome, {user?.fullName}!</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        {user?.role === 'ROLE_EMPLOYER' ? 'Manage your job postings and review applications' : 'Find your dream job and track your applications'}
      </p>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.totalJobs}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Available Jobs</div>
        </div>
        {user?.role === 'ROLE_EMPLOYEE' && (
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.myApplications}</div>
            <div style={{ fontSize: '14px', opacity: 0.9' }}>My Applications</div>
          </div>
        )}
        {user?.role === 'ROLE_EMPLOYER' && (
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.myJobs}</div>
            <div style={{ fontSize: '14px', opacity: 0.9' }}>My Job Postings</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <h2>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {user?.role === 'ROLE_EMPLOYER' ? (
          <>
            <Link to="/post-job" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>➕</div>
                <h3 style={{ color: '#667eea' }}>Post New Job</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Create a new job listing</p>
              </div>
            </Link>
            <Link to="/my-jobs" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                <h3 style={{ color: '#28a745' }}>My Jobs</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Manage your postings</p>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link to="/jobs" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>💼</div>
                <h3 style={{ color: '#667eea' }}>Browse Jobs</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Find your dream job</p>
              </div>
            </Link>
            <Link to="/applications" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
                <h3 style={{ color: '#ffc107' }}>Applications</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Track your applications</p>
              </div>
            </Link>
          </>
        )}
        <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👤</div>
            <h3 style={{ color: '#17a2b8' }}>Profile</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Update your information</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Continue in next message due to length...
