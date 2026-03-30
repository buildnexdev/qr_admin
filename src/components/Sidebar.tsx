import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  Grid, 
  ClipboardList,
  LogOut,
  Settings,
  Target
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <aside className="sidebar">
      <div className="logo">
        <LayoutDashboard size={28} strokeWidth={2.5} />
        <span>CRAVING</span>
      </div>
      
      <nav>
        <div className="nav-label">Main Menu</div>
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <LayoutDashboard size={20} /> 
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <ClipboardList size={20} /> 
          <span>Orders</span>
        </NavLink>
        <NavLink 
          to="/menu" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <Utensils size={20} /> 
          <span>Menu</span>
        </NavLink>
        <NavLink 
          to="/tables" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <Grid size={20} /> 
          <span>Tables</span>
        </NavLink>
        
        <div className="nav-label" style={{ marginTop: '24px' }}>System</div>
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <Target size={20} /> 
          <span>Analytics</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <Settings size={20} /> 
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={() => dispatch(logout())}>
          <LogOut size={20} /> 
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
