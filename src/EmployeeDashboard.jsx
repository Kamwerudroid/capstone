// src/components/EmployeeDashboard.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');

  // New state for manual sales form
  const [saleProductId, setSaleProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('');

  const navigate = useNavigate();
  const productsCollectionRef = collection(db, 'products');
  const storesCollectionRef = collection(db, 'stores');
  const salesCollectionRef = collection(db, 'sales');

  // Fetch data
  const getProducts = async () => {
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const getStores = async () => {
    const data = await getDocs(storesCollectionRef);
    setStores(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    getProducts();
    getStores();
  }, []);

  // Function to record a sale by decrementing stock
  const handleRecordSale = async (productId, currentQuantity) => {
    if (currentQuantity <= 0) return;
    if (!selectedStore) {
        alert('Please select your store first!');
        return;
    }

    const productDoc = doc(db, 'products', productId);
    await updateDoc(productDoc, { quantity: currentQuantity - 1 });
    
    await addDoc(salesCollectionRef, {
        productId: productId,
        storeId: selectedStore,
        quantitySold: 1,
        timestamp: Timestamp.now()
    });

    getProducts();
  };

  // NEW: Function to handle manual sale entry from the form
  const handleManualSale = async (e) => {
    e.preventDefault();
    if (!selectedStore || !saleProductId || !saleQuantity) {
        alert('Please fill out all sales fields.');
        return;
    }
    
    const quantity = Number(saleQuantity);
    if (quantity <= 0) {
        alert('Quantity must be a positive number.');
        return;
    }

    // Update product stock
    const productDoc = doc(db, 'products', saleProductId);
    const productSnap = await getDoc(productDoc);
    if (productSnap.exists()) {
        const currentQuantity = productSnap.data().quantity;
        if (currentQuantity >= quantity) {
            await updateDoc(productDoc, { quantity: currentQuantity - quantity });

            // Record the sale
            await addDoc(salesCollectionRef, {
                productId: saleProductId,
                storeId: selectedStore,
                quantitySold: quantity,
                timestamp: Timestamp.now()
            });

            // Clear the form and refresh products
            setSaleProductId('');
            setSaleQuantity('');
            getProducts();
        } else {
            alert('Insufficient stock to complete this sale.');
        }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header>
        <h2 className='font-bold font-3x'>Employee Dashboard</h2>
        <button onClick={handleLogout}>Log Out</button>
      </header>
      
      <div className="store-select">
        <h4>Select your Store:</h4>
        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
          <option value="">-- Choose a Store --</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>{store.name}</option>
          ))}
        </select>
      </div>

      {/* NEW: Manual Sales Form */}
      <div className="form-section">
        <h3>Record a New Sale</h3>
        <form onSubmit={handleManualSale}>
          <select value={saleProductId} onChange={(e) => setSaleProductId(e.target.value)} required>
            <option value="">-- Select Product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantity Sold"
            value={saleQuantity}
            onChange={(e) => setSaleQuantity(e.target.value)}
            required
            min="1"
          />
          <button type="submit">Add Sale</button>
        </form>
      </div>

      <div className="inventory-list">
        <h3>Current Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>
                  <button onClick={() => handleRecordSale(product.id, product.quantity)}>Record Single Sale (-1)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;