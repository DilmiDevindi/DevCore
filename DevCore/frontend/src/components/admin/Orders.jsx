// frontend/src/components/admin/Orders.js
import { useState, useEffect } from 'react';
import { orderAPI } from '../../api/api';
import Loader from '../common/Loader';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
    date: '',
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll(filters);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateStatus(orderId, newStatus);
      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('Order status updated successfully');
      }
    } catch (error) {
      alert('Error updating order status: ' + error.response?.data?.message);
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus) => {
    try {
      const response = await orderAPI.updatePayment(orderId, paymentStatus);
      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, paymentStatus } : order
        ));
        alert('Payment status updated successfully');
      }
    } catch (error) {
      alert('Error updating payment status: ' + error.response?.data?.message);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await orderAPI.getById(orderId);
      setSelectedOrder(response.data.order);
      setShowModal(true);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert('Error fetching order details');
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

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'refunded': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  if (loading && orders.length === 0) {
    return <Loader message="Loading orders..." />;
  }

  return (
    <div className="orders-container">
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="fas fa-shopping-cart me-2"></i>
            Orders Management
          </h2>
          <button 
            className="btn btn-outline-primary"
            onClick={fetchOrders}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Order Type</label>
                <select 
                  className="form-select"
                  value={filters.orderType}
                  onChange={(e) => handleFilterChange('orderType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="dine-in">Dine In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="pre-order">Pre-order</option>
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>

              <div className="col-md-3 mb-3 d-flex align-items-end">
                <button 
                  className="btn btn-secondary w-100"
                  onClick={() => setFilters({ status: '', orderType: '', date: '' })}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No orders found</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>{order.orderNumber}</strong>
                          {order.tableNumber && (
                            <><br /><small className="text-muted">Table: {order.tableNumber}</small></>
                          )}
                        </td>
                        <td>
                          <div>
                            {order.customer?.firstName} {order.customer?.lastName}
                            <br />
                            <small className="text-muted">{order.customer?.email}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {order.items?.length || 0} items
                          </span>
                        </td>
                        <td>
                          <strong>Rs. {order.totalAmount?.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {order.orderType}
                          </span>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button
                              className={`btn btn-sm dropdown-toggle badge ${getStatusBadgeClass(order.status)}`}
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              {order.status}
                            </button>
                            <ul className="dropdown-menu">
                              {['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
                                .filter(status => status !== order.status)
                                .map(status => (
                                  <li key={status}>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleStatusUpdate(order._id, status)}
                                    >
                                      {status}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button
                              className={`btn btn-sm dropdown-toggle badge ${getPaymentBadgeClass(order.paymentStatus)}`}
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              {order.paymentStatus}
                            </button>
                            <ul className="dropdown-menu">
                              {['pending', 'paid', 'refunded']
                                .filter(status => status !== order.paymentStatus)
                                .map(status => (
                                  <li key={status}>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handlePaymentUpdate(order._id, status)}
                                    >
                                      {status}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </td>
                        <td>
                          <small>
                            {new Date(order.createdAt).toLocaleString()}
                          </small>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewOrderDetails(order._id)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Order Details - {selectedOrder.orderNumber}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Customer Information</h6>
                      <p>
                        <strong>Name:</strong> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}<br />
                        <strong>Email:</strong> {selectedOrder.customer?.email}<br />
                        <strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}<br />
                        <strong>Student ID:</strong> {selectedOrder.customer?.studentId || 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6>Order Information</h6>
                      <p>
                        <strong>Type:</strong> {selectedOrder.orderType}<br />
                        <strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status}</span><br />
                        <strong>Payment:</strong> <span className={`badge ${getPaymentBadgeClass(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span><br />
                        <strong>Table:</strong> {selectedOrder.tableNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <h6>Order Items</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.menuItem?.name}</td>
                            <td>{item.quantity}</td>
                            <td>Rs. {item.price?.toFixed(2)}</td>
                            <td>Rs. {(item.quantity * item.price)?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan="3">Total Amount:</th>
                          <th>Rs. {selectedOrder.totalAmount?.toFixed(2)}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {selectedOrder.specialRequests && (
                    <>
                      <h6>Special Requests</h6>
                      <p className="text-muted">{selectedOrder.specialRequests}</p>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;