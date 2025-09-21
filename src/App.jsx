import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import './App.css'; 

// A component to check user's role before rendering a protected route
const ProtectedRoute = ({ children, isAdminRequired }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check user role from Firestore (a simple way to handle roles)
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().role === 'admin');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        navigate('/login'); // Redirect to login if not authenticated
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle access based on role
  if (isAdminRequired && !isAdmin) {
    return <div>Access Denied. You are not an Admin.</div>;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute isAdminRequired={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee" element={
            <ProtectedRoute isAdminRequired={false}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute isAdminRequired={false}>
              <EmployeeDashboard /> {/* Default to employee dashboard */}
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
