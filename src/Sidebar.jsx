import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Create this CSS file for styling

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h3>Admin Tools</h3>
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard/stores" activeClassName="active-link">
              Stores
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/inventory" activeClassName="active-link">
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/analytics" activeClassName="active-link">
              Analytics
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;