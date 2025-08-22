// frontend/src/components/common/Navbar.js
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
      case 'staff':
        return '/admin/dashboard';
      case 'student':
      case 'lecturer':
        return '/customer/menu';
      default:
        return '/';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to={getDashboardLink()}>
          <i className="fas fa-utensils me-2"></i>
          Canteen Management
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/orders">
                    <i className="fas fa-shopping-cart me-1"></i>Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/menu">
                    <i className="fas fa-book me-1"></i>Menu
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/inventory">
                    <i className="fas fa-boxes me-1"></i>Inventory
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">
                    <i className="fas fa-users me-1"></i>Users
                  </Link>
                </li>
              </>
            )}
            
            {user?.role === 'staff' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/orders">
                    <i className="fas fa-shopping-cart me-1"></i>Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/menu">
                    <i className="fas fa-book me-1"></i>Menu
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/inventory">
                    <i className="fas fa-boxes me-1"></i>Inventory
                  </Link>
                </li>
              </>
            )}
            
            {(user?.role === 'student' || user?.role === 'lecturer') && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/customer/menu">
                    <i className="fas fa-book me-1"></i>Menu
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/customer/orders">
                    <i className="fas fa-history me-1"></i>My Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/customer/table-booking">
                    <i className="fas fa-chair me-1"></i>Book Table
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user me-1"></i>
                {user?.firstName} {user?.lastName}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="fas fa-user-edit me-1"></i>Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i>Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;