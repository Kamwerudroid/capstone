// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbO6ZQG6GiHaoTjjjJF6BmPQAp7UOQdHM",
  authDomain: "capstone-e6f76.firebaseapp.com",
  projectId: "capstone-e6f76",
  storageBucket: "capstone-e6f76.firebasestorage.app",
  messagingSenderId: "146014307374",
  appId: "1:146014307374:web:56d06763a248f623ee4bbf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };