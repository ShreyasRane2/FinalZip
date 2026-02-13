// import React, { useState, createContext, useContext, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { profileAPI, jobAPI, applicationAPI, resumeAPI, notificationAPI } from './services/api';
// import './App.css';

// // Auth Context
// const AuthContext = createContext();
// const useAuth = () => useContext(AuthContext);

// function AuthProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     if (token) {a/
//       axios.defaults.headers