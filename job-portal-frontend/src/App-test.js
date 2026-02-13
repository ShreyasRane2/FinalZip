import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Test imports one by one
console.log('Testing imports...');

try {
  const PrivateRoute = require('./components/PrivateRoute').default;
  console.log('✓ PrivateRoute:', PrivateRoute);
} catch (e) {
  console.error('✗ PrivateRoute failed:', e.message);
}

try {
  const Navbar = require('./components/Navbar').default;
  console.log('✓ Navbar:', Navbar);
} catch (e) {
  console.error('✗ Navbar failed:', e.message);
}

try {
  const Login = require('./pages/Login').default;
  console.log('✓ Login:', Login);
} catch (e) {
  console.error('✗ Login failed:', e.message);
}

try {
  const Dashboard = require('./pages/Dashboard').default;
  console.log('✓ Dashboard:', Dashboard);
} catch (e) {
  console.error('✗ Dashboard failed:', e.message);
}

function App() {
  return (
    <Router>
      <div>
        <h1>Component Import Test</h1>
        <p>Check console for results</p>
      </div>
    </Router>
  );
}

export default App;
