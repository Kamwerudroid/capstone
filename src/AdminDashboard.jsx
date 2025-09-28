// src/components/AdminDashboard.js

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useNavigate ,Routes, Route} from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from './Sidebar';

import "./Dashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(''); 
  
  

  // State for Forms
  const [productName, setProductName] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalSales, setTotalSales] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [storeDistributor, setStoreDistributor] = useState("");

  const navigate = useNavigate();
  const productsCollectionRef = collection(db, "products");
  const storesCollectionRef = collection(db, "stores");
  const salesCollectionRef = collection(db, "sales");

  // --- Data Fetching ---
  const getProducts = async () => {
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const getStores = async () => {
    const data = await getDocs(storesCollectionRef);
    setStores(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const getSales = async () => {
    const data = await getDocs(salesCollectionRef);
    setSales(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    getProducts();
    getStores();
    getSales();
  }, []);

  // --- Store Management ---
  const handleAddStore = async (e) => {
    e.preventDefault();
    await addDoc(storesCollectionRef, {
      name: storeName,
      location: storeLocation,
      distributor: storeDistributor,
    });
    setStoreName("");
    setStoreLocation("");
    setStoreDistributor("");
    getStores();
  };

  const handleDeleteStore = async (id, storeName) => {    
    const confirmDelete = window.confirm(`Are you sure you want to delete the store: ${storeName}? This action cannot be undone.`);

    
    if (confirmDelete) {
        try {
            const storeDoc = doc(db, 'stores', id);
            await deleteDoc(storeDoc);
            getStores(); // Refresh the store list
            alert(`${storeName} has been successfully deleted.`);
        } catch (error) {
            console.error("Error deleting store: ", error);
            alert(`Failed to delete ${storeName}. Please try again.`);
        }
    }
};

  // --- Product Management ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    await addDoc(productsCollectionRef, {
      name: productName,
      quantity: Number(productQuantity),
      unitPrice: Number(unitPrice),
      totalSales: Number(productQuantity * unitPrice),
      storeId: "N/A",
    });
    setProductName("");
    setProductQuantity("");
    setUnitPrice("");
    setTotalSales("");
    getProducts();
  };

  const handleDeleteProduct = async (id, productName) => {    
    const confirmDelete = window.confirm(`Are you sure you want to delete the product: ${productName}?`);
    
    // If the user confirms, proceed with the deletion
    if (confirmDelete) {
        try {
            const productDoc = doc(db, 'products', id);
            await deleteDoc(productDoc);
            getProducts(); // Refresh the list
            alert(`${productName} has been successfully deleted.`);
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert(`Failed to delete ${productName}. Please try again.`);
        }
    }
};

const getMonthlyProductSales = () => {
    const monthlySalesData = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Filter sales based on the selected product ID
    const filteredSales = selectedProductId 
        ? sales.filter(sale => sale.productId === selectedProductId)
        : sales;

    filteredSales.forEach(sale => {
      if (sale.timestamp && typeof sale.timestamp.toDate === 'function') {
        const date = sale.timestamp.toDate();
        const monthYear = `${months[date.getMonth()]}-${date.getFullYear()}`;
        
        if (monthlySalesData[monthYear]) {
          monthlySalesData[monthYear] += sale.quantitySold;
        } else {
          monthlySalesData[monthYear] = sale.quantitySold;
        }
      }
    });

    const sortedKeys = Object.keys(monthlySalesData).sort((a, b) => {
      const dateA = new Date(a.replace('-', ' 1, '));
      const dateB = new Date(b.replace('-', ' 1, '));
      return dateA - dateB;
    });

    return {
      labels: sortedKeys,
      datasets: [
        {
          label: `Total Units Sold (${selectedProductId ? products.find(p => p.id === selectedProductId)?.name : 'All Products'})`,
          data: sortedKeys.map(key => monthlySalesData[key]),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
      ],
    };
};


  // --- Sales Analytics Dashboard (Updated) ---
const getMonthlySales = () => {
    const monthlySalesData = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Filter sales based on the selected store ID
    const filteredSales = selectedStoreId 
        ? sales.filter(sale => sale.storeId === selectedStoreId) 
        : sales;

    filteredSales.forEach(sale => {
      if (sale.timestamp && typeof sale.timestamp.toDate === 'function') {
        const date = sale.timestamp.toDate();
        const monthYear = `${months[date.getMonth()]}-${date.getFullYear()}`;
        
        if (monthlySalesData[monthYear]) {
          monthlySalesData[monthYear] += sale.quantitySold;
        } else {
          monthlySalesData[monthYear] = sale.quantitySold;
        }
      }
    });

    const sortedKeys = Object.keys(monthlySalesData).sort((a, b) => {
      const dateA = new Date(a.replace('-', ' 1, '));
      const dateB = new Date(b.replace('-', ' 1, '));
      return dateA - dateB;
    });

    return {
      labels: sortedKeys,
      datasets: [
        {
          label: `Total Units Sold (${selectedStoreId ? stores.find(s => s.id === selectedStoreId)?.name : 'All Stores'})`,
          data: sortedKeys.map(key => monthlySalesData[key]),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  const monthlySalesChartData = getMonthlySales();
  const monthlyProductSalesChartData = getMonthlyProductSales();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const StoresSection = () => (
    <>
      <div className="form-section">
        <h3>Add New Store</h3>
        <form onSubmit={handleAddStore}>
          <input type="text" placeholder="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          <input type="text" placeholder="Location" value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)} required />
          <input type="text" placeholder="Distributor Name" value={storeDistributor} onChange={(e) => setStoreDistributor(e.target.value)} required />
          <button type="submit">Add Store</button>
        </form>
      </div>
      <div className="list-section">
        <h3>Existing Stores</h3>
        <ul>
          {stores.map(store => (
            <li key={store.id}>
              {store.name} - {store.location} ({store.distributor})
              <button onClick={() => handleDeleteStore(store.id, store.name)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  const InventorySection = () => (
    <>
      <div className="form-section">
        <h3>Add New Product</h3>
        <form onSubmit={handleAddProduct}>
          <select value={selectedStoreForProduct} onChange={(e) => setSelectedStoreForProduct(e.target.value)} required>
            <option value="">-- Select Store --</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <input type="text" placeholder="Product Name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
          <input type="number" placeholder="Quantity" value={newProductQuantity} onChange={(e) => setNewProductQuantity(e.target.value)} required />
          <button type="submit">Add Product</button>
        </form>
      </div>
      <div className="list-section">
        <h3>Current Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Store</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{stores.find(s => s.id === product.storeId)?.name || 'N/A'}</td>
                <td>
                  <button onClick={() => handleDeleteProduct(product.id, product.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const AnalyticsSection = () => (
    <div className="analytics-section">
      <h3>Sales Analytics</h3>
      <h4>Monthly Sales by Store</h4>
      <select value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)}>
        <option value="">All Stores</option>
        {stores.map(store => (
            <option key={store.id} value={store.id}>{store.name}</option>
        ))}
      </select>
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          {sales.length > 0 ? (
              <Line data={monthlySalesChartData} />
          ) : (
              <p>No sales data to display yet. Record some sales from the employee dashboard.</p>
          )}
      </div>
      <h4>Monthly Sales by Product</h4>
      <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
        <option value="">All Products</option>
        {products.map(product => (
            <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          {sales.length > 0 ? (
              <Line data={monthlyProductSalesChartData} />
          ) : (
              <p>No sales data to display yet. Record some sales from the employee dashboard.</p>
          )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <header>
          <h2>Admin Dashboard</h2>
          <button onClick={handleLogout}>Log Out</button>
        </header>
        <Routes>
          <Route path="stores" element={<StoresSection />} />
          <Route path="inventory" element={<InventorySection />} />
          <Route path="analytics" element={<AnalyticsSection />} />
          <Route path="/" element={<StoresSection />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;