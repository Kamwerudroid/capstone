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
import { useNavigate } from "react-router-dom";
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

  // --- Sales Analytics Dashboard (Updated) ---
  const getMonthlySales = () => {
    const monthlySalesData = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    sales.forEach((sale) => {
      // Get the month and year from the Firestore timestamp
      const date = sale.timestamp.toDate();
      const monthYear = `${months[date.getMonth()]}-${date.getFullYear()}`;

      if (monthlySalesData[monthYear]) {
        monthlySalesData[monthYear] += sale.quantitySold;
      } else {
        monthlySalesData[monthYear] = sale.quantitySold;
      }
    });

    const sortedKeys = Object.keys(monthlySalesData).sort((a, b) => {
      const dateA = new Date(a.replace("-", " 1, "));
      const dateB = new Date(b.replace("-", " 1, "));
      return dateA - dateB;
    });

    return {
      labels: sortedKeys,
      datasets: [
        {
          label: "Total Units Sold",
          data: sortedKeys.map((key) => monthlySalesData[key]),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.1,
        },
      ],
    };
  };

  const monthlySalesChartData = getMonthlySales();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header>
        <h2 className="font-5x font-bold">Admin Dashboard</h2>
        <button onClick={handleLogout}>Log Out</button>
      </header>

      <div className="form-section">
        <h3>Add New Store</h3>
        <form onSubmit={handleAddStore}>
          <input
            type="text"
            placeholder="Store Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Distributor Name"
            value={storeDistributor}
            onChange={(e) => setStoreDistributor(e.target.value)}
            required
          />
          <button type="submit">Add Store</button>
        </form>
      </div>

      <div className="list-section">
        <h3 className="font-bold font-2x m-3 ">Existing Stores</h3>
        <table className="border-2">
          <thead className="border-2">
            <tr className="border-2">
              <th className="px-2 border-2">Store Name</th>
              <th className="px-2 border-2">Location</th>
              <th className="px-2 border-2">Distributor</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="border-2">{store.name}</td>
                <td className="border-2">{store.location}</td>
                <td className="border-2">{store.distributor}</td>
                <td>
                  <button onClick={() => handleDeleteStore(store.id, store.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr className="m-5"></hr>

      <div className="form-section">
        <h3 className="m-3 font-bold font-2x">Add New Product</h3>
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Unit Price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            required
          />
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="list-section">
        <h3 className="m-5 font-bold font-4x">Current Inventory</h3>
        <table>
          <thead>
            <tr>
              <th className="px-2 border-2">Name</th>
              <th className="px-2 border-2">Quantity</th>
              <th className="px-2 border-2">Unit price KSh</th>
              <th className="px-2 border-2">Total sales</th>
              <th className="px-2 border-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="border-2">{product.name}</td>
                <td className="border-2">{product.quantity}</td>
                <td className="border-2">KSh{product.unitPrice}</td>
                <td className="border-2">KSh{product.totalSales}</td>

                <td className="border-2">
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="analytics-section">
        <h3 className="m-2 font-bold font-3x mt-5">Sales Analytics</h3>

        <h4>Monthly Sales Trend</h4>
        <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
          <Line data={monthlySalesChartData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
