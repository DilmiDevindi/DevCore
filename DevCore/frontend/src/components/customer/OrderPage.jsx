// frontend/src/components/customer/OrderPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './OrderPage.css';

const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState({
    orderType: 'dine-in',
    paymentMethod: 'cash',
    tableNumber: '',
    scheduledTime: '',
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate('/customer/menu');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setOrderForm({ ...orderForm, [field]: value });
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Validate form
    if (orderForm.orderType === 'dine-in' && !orderForm.tableNumber) {
      alert('Please enter table number for dine-in orders');
      return;
    }

    if (orderForm.orderType === 'pre-order' && !orderForm.scheduledTime) {
      alert('Please select scheduled time for pre-orders');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || ''
        })),
        ...orderForm,
        scheduledTime: orderForm.scheduledTime ? new Date(orderForm.scheduledTime) : undefined
      };

      const response = await orderAPI.create(orderData);
      
      if (response.data.success) {
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to order confirmation
        navigate(`/customer/order-confirmation/${response.data.order._id}`);
      }
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const updateItemInstructions = (itemId, instructions) => {
    setCart(cart.map(item =>
      item._id === itemId
        ? { ...item, specialInstructions: instructions }
        : item
    ));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item._id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    if (updatedCart.length === 0) {
      navigate('/customer/menu');
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <button className="btn btn-primary" onClick={() => navigate('/customer/menu')}>
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="order-page-container">
      <div className="container py-4">
        <div className="row">
          {/* Order Items */}
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Order Items ({getTotalItems()})
                </h5>
              </div>
              <div className="card-body">
                {cart.map((item) => (
                  <div key={item._id} className="order-item mb-3">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="text-muted mb-0">
                          Rs. {item.price.toFixed(2)} × {item.quantity} = Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Special instructions (optional)"
                          value={item.specialInstructions || ''}
                          onChange={(e) => updateItemInstructions(item._id, e.target.value)}
                        />
                      </div>
                      <div className="col-md-1">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details Form */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-cog me-2"></i>
                  Order Details
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitOrder}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Order Type</label>
                      <select
                        className="form-select"
                        value={orderForm.orderType}
                        onChange={(e) => handleInputChange('orderType', e.target.value)}
                        required
                      >
                        <option value="dine-in">Dine In</option>
                        <option value="takeaway">Takeaway</option>
                        <option value="pre-order">Pre-order</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-select"
                        value={orderForm.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="digital">Digital Payment</option>
                        <option value="university-credit">University Credit</option>
                      </select>
                    </div>

                    {orderForm.orderType === 'dine-in' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Table Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter table number"
                          value={orderForm.tableNumber}
                          onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {orderForm.orderType === 'pre-order' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Scheduled Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          min={getCurrentDateTime()}
                          value={orderForm.scheduledTime}
                          onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="col-12 mb-3">
                      <label className="form-label">Special Requests</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Any special requests or dietary requirements..."
                        value={orderForm.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card order-summary">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-receipt me-2"></i>
                  Order Summary
                </h5>
              </div>
              <div className="card-body">
                {/* Customer Info */}
                <div className="mb-3">
                  <h6>Customer Information</h6>
                  <p className="mb-1">
                    <strong>{user?.firstName} {user?.lastName}</strong>
                  </p>
                  <p className="text-muted mb-0">{user?.email}</p>
                  {user?.studentId && (
                    <p className="text-muted mb-0">Student ID: {user.studentId}</p>
                  )}
                </div>

                <hr />

                {/* Order Type Info */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Order Type:</span>
                    <strong>{orderForm.orderType.replace('-', ' ').toUpperCase()}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Payment Method:</span>
                    <strong>{orderForm.paymentMethod.replace('-', ' ').toUpperCase()}</strong>
                  </div>
                  {orderForm.tableNumber && (
                    <div className="d-flex justify-content-between">
                      <span>Table Number:</span>
                      <strong>{orderForm.tableNumber}</strong>
                    </div>
                  )}
                </div>

                <hr />

                {/* Items Summary */}
                <div className="mb-3">
                  {cart.map((item) => (
                    <div key={item._id} className="d-flex justify-content-between mb-1">
                      <span>{item.name} × {item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Total */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <strong>Total Amount:</strong>
                    <strong className="text-primary fs-5">
                      Rs. {getTotalAmount().toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmitOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Place Order
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/customer/menu')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;