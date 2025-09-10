// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore'; 
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
export const auth=getAuth(app);
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password); 
export const logoutUser = () => signOut(auth);

const db = getFirestore(app); 
export const usersCollection = collection(db, 'users'); 
export const coursesCollection = collection(db, 'courses'); 
export const setUserRole = (userId, role) => setDoc(doc(db, 'users', userId), { role }); 
export const getUserRole = async (userId) => {
    try { 
const userDoc = await getDoc(doc(db, 'users', userId)); 
return userDoc.exists() ? userDoc.data().role : null; 
} catch (error) { 
console.error('Error getting user role:', error); 
return null; 
} 
};