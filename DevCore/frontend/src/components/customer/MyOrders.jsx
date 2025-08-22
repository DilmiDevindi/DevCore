import { useState, useEffect } from 'react';
import { orderAPI } from '../../api/api';
import Loader from '../common/Loader';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await orderAPI.getUserOrders(params);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.cancel(orderId);
        fetchOrders();
        alert('Order cancelled successfully');
      } catch (error) {
        alert('Error cancelling order: ' + error.response?.data?.message);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'preparing': return 'bg-primary';
      case 'ready': return 'bg-success';
      case 'completed': return 'bg-dark';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) return <Loader message="Loading your orders..." />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-history me-2"></i>My Orders</h2>
        <select
          className="form-select"
          style={{width: 'auto'}}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No orders found</h5>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <strong>{order.orderNumber}</strong>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Total:</strong> Rs. {order.totalAmount.toFixed(2)}
                  </p>
                  <p className="mb-2">
                    <strong>Items:</strong> {order.items.length}
                  </p>
                  <p className="mb-2">
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong>Type:</strong> {order.orderType}
                  </p>
                  
                  <div className="mt-3">
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => cancelOrder(order._id)}
                      >
                        Cancel
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-primary">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
