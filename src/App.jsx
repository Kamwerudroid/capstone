import { useState, useEffect } from 'react';
import { auth } from './firebase';
import './App.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { signOut } from 'firebase/auth'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 
import Login from 'Login';
import AdminDashboard from 'AdminDashboard';
import EmployeeDashboard from 'EmployeeDashboard';

function App() {
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[user,setUser]=useState(null);
  const[role,setRole] =useState(null);
  const[loading,setLoading]=useState(true);

  
  return (
    <>
      
    </>
  )
}

export default App
