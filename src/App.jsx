import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';

// This is the main App component that contains all the logic and UI.
const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Firestore & Auth instances. These will be initialized in useEffect.
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    try {
      
      const appId = typeof appId !== 'undefined' ? appId : 'default-app-id';
      const firebaseConfig = typeof firebaseConfig !== 'undefined' ? JSON.parse(firebaseConfig) : {};
      const initialAuthToken = typeof initialAuthToken !== 'undefined' ? initialAuthToken : null;
      
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setAuth(authInstance);

      // Set up authentication listener
      const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setUserId(currentUser.uid);
        } else {
          setUser(null);
          setUserId(null);
        }
        setIsAuthReady(true);
        setLoading(false);
      });

      // Sign in with the custom token if available
      if (initialAuthToken) {
        signInWithCustomToken(authInstance, initialAuthToken)
          .catch((error) => {
            console.error("Error signing in with custom token:", error.message);
          });
      }

      // Cleanup the listener on component unmount
      return () => unsubscribe();
    } catch (e) {
      console.error("Failed to initialize Firebase:", e);
      setError("Failed to initialize Firebase. Check console for details.");
      setLoading(false);
    }
  }, []);

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Authentication service is not ready.");
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    if (!auth) return;
    try {
      setError('');
      await signOut(auth);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error("Sign-out error:", error);
      setError(error.message);
    }
  };

  if (loading || !isAuthReady) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>
          Firebase Auth
        </h1>

        {user ? (
          <div>
            <p>
              You are signed in as:
              <br />
              <span>
                {user.email}
              </span>
            </p>
            {userId && (
              <p>
                Your User ID:
                <br />
                <span>
                  {userId}
                </span>
              </p>
            )}
            <button
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSignIn}>
              {error && (
                <div>
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit"
              >
                Sign In
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
