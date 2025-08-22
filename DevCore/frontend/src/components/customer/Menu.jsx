// frontend/src/components/customer/Menu.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    dietaryTags: '',
  });
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMenuData();
  }, [filters]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items with filters
      const menuResponse = await menuAPI.getAll({ ...filters, available: true });
      setMenuItems(menuResponse.data.menuItems || []);

      // Fetch categories
      const categoriesResponse = await menuAPI.getCategories();
      setCategories(categoriesResponse.data.categories || []);
      
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem) => {
    const existingItem = cart.find(item => item._id === menuItem._id);
    
    if (existingItem) {
      if (existingItem.quantity >= menuItem.remainingQuantity) {
        alert('Maximum available quantity reached');
        return;
      }
      setCart(cart.map(item =>
        item._id === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter(item => item._id !== menuItemId));
  };

  const updateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(menuItemId);
      return;
    }
    
    const menuItem = menuItems.find(item => item._id === menuItemId);
    if (newQuantity > menuItem.remainingQuantity) {
      alert('Maximum available quantity reached');
      return;
    }
    
    setCart(cart.map(item =>
      item._id === menuItemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to cart first');
      return;
    }
    
    // Store cart in localStorage for the order page
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/customer/order');
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  if (loading) {
    return <Loader message="Loading menu..." />;
  }

  return (
    <div className="menu-container">
      <div className="container-fluid py-4">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-filter me-2"></i>
                  Filters
                </h5>
              </div>
              <div className="card-body">
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dietary Preferences */}
                <div className="mb-4">
                  <label className="form-label">Dietary Preferences</label>
                  <select
                    className="form-select"
                    value={filters.dietaryTags}
                    onChange={(e) => handleFilterChange('dietaryTags', e.target.value)}
                  >
                    <option value="">All Items</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                  </select>
                </div>

                {/* User's Dietary Preference */}
                {user?.dietaryPreference && user.dietaryPreference !== 'None' && (
                  <div className="alert alert-info">
                    <small>
                      <i className="fas fa-leaf me-1"></i>
                      Your preference: {user.dietaryPreference}
                    </small>
                  </div>
                )}

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => setFilters({ category: '', dietaryTags: '' })}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="fas fa-book-open me-2"></i>
                Our Menu
              </h2>
              <button
                className="btn btn-primary position-relative"
                onClick={() => setShowCart(!showCart)}
              >
                <i className="fas fa-shopping-cart me-1"></i>
                Cart
                {getTotalItems() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>

            {menuItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No menu items found</h5>
                <p className="text-muted">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="row">
                {menuItems.map((item) => (
                  <div key={item._id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card menu-item-card h-100">
                      {item.image && (
                        <img
                          src={item.image}
                          className="card-img-top"
                          alt={item.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title">{item.name}</h5>
                          <span className="badge bg-primary">Rs. {item.price.toFixed(2)}</span>
                        </div>
                        
                        {item.description && (
                          <p className="card-text text-muted small">{item.description}</p>
                        )}

                        {/* Dietary Tags */}
                        {item.dietaryTags && item.dietaryTags.length > 0 && (
                          <div className="mb-2">
                            {item.dietaryTags.map(tag => (
                              <span key={tag} className="badge bg-success me-1 mb-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Nutritional Info */}
                        {item.nutritionalInfo && (
                          <div className="nutritional-info mb-2">
                            <small className="text-muted">
                              <i className="fas fa-fire me-1"></i>
                              {item.nutritionalInfo.calories} cal
                            </small>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">
                            <i className="fas fa-clock me-1"></i>
                            {item.preparationTime} mins
                          </span>
                          <span className="text-muted small">
                            Available: {item.remainingQuantity}
                          </span>
                        </div>

                        <div className="mt-auto">
                          {item.remainingQuantity > 0 ? (
                            <button
                              className="btn btn-primary w-100"
                              onClick={() => addToCart(item)}
                            >
                              <i className="fas fa-plus me-1"></i>
                              Add to Cart
                            </button>
                          ) : (
                            <button className="btn btn-secondary w-100" disabled>
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className={`cart-sidebar ${showCart ? 'show' : ''}`}>
          <div className="cart-header">
            <h5>
              <i className="fas fa-shopping-cart me-2"></i>
              Your Cart ({getTotalItems()})
            </h5>
            <button
              className="btn-close"
              onClick={() => setShowCart(false)}
            ></button>
          </div>
          
          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-shopping-cart fa-2x text-muted mb-2"></i>
                <p className="text-muted">Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item._id} className="cart-item mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.name}</h6>
                        <small className="text-muted">Rs. {item.price.toFixed(2)} each</small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="quantity-controls">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <strong>Rs. {(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Total: Rs. {getTotalAmount().toFixed(2)}</strong>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={proceedToOrder}
              >
                Proceed to Order
                <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          )}
        </div>

        {/* Cart Overlay */}
        {showCart && (
          <div
            className="cart-overlay"
            onClick={() => setShowCart(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default Menu;
                            