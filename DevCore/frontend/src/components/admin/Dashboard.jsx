import { useState, useEffect } from 'react';
import { orderAPI, inventoryAPI, userAPI } from '../../api/api';
import Loader from '../common/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent orders
      const ordersResponse = await orderAPI.getAll({ limit: 5, page: 1 });
      const orders = ordersResponse.data.orders || [];
      setRecentOrders(orders);

      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.totalAmount, 0);
      const pendingOrders = orders.filter(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length;

      // Fetch low stock items
      const lowStockResponse = await inventoryAPI.getLowStock();
      const lowStock = lowStockResponse.data.lowStockItems || [];
      setLowStockItems(lowStock);

      // Fetch users
      const usersResponse = await userAPI.getAll();
      const users = usersResponse.data.users || [];

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockItems: lowStock.length,
        totalUsers: users.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-container">
      <div className="container-fluid py-4">
        <h2 className="mb-4">
          <i className="fas fa-tachometer-alt me-2"></i>
          Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card stats-card bg-primary text-white">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6>Total Orders</h6>
                  <h3>{stats.totalOrders}</h3>
                </div>
                <i className="fas fa-shopping-cart stats-icon"></i>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card stats-card bg-success text-white">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6>Revenue</h6>
                  <h3>Rs. {stats.totalRevenue.toFixed(2)}</h3>
                </div>
                <i className="fas fa-dollar-sign stats-icon"></i>
              </div>
            </div>
          </div>

          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card stats-card bg-warning text-white">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6>Pending</h6>
                  <h3>{stats.pendingOrders}</h3>
                </div>
                <i className="fas fa-clock stats-icon"></i>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stats-card bg-danger text-white">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6>Low Stock</h6>
                  <h3>{stats.lowStockItems}</h3>
                </div>
                <i className="fas fa-exclamation-triangle stats-icon"></i>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card stats-card bg-info text-white">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6>Total Users</h6>
                  <h3>{stats.totalUsers}</h3>
                </div>
                <i className="fas fa-users stats-icon"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Recent Orders */}
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>
                  <i className="fas fa-shopping-cart me-2"></i>
                  Recent Orders
                </h5>
                <a href="/admin/orders" className="btn btn-primary btn-sm">
                  View All
                </a>
              </div>
              <div className="card-body">
                {recentOrders.length === 0 ? (
                  <p className="text-muted">No recent orders</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id}>
                            <td><strong>{order.orderNumber}</strong></td>
                            <td>{order.customer?.firstName} {order.customer?.lastName}</td>
                            <td>Rs. {order.totalAmount.toFixed(2)}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Low Stock Alert
                </h5>
                <a href="/admin/inventory" className="btn btn-warning btn-sm">
                  Manage Stock
                </a>
              </div>
              <div className="card-body">
                {lowStockItems.length === 0 ? (
                  <p className="text-success">All items are well stocked!</p>
                ) : (
                  <div className="low-stock-list">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <div key={item._id} className="low-stock-item mb-3">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{item.ingredient}</strong><br />
                            <small className="text-muted">
                              Current: {item.currentStock} {item.unit}
                            </small>
                          </div>
                          <span className="badge bg-danger">Low</span>
                        </div>
                      </div>
                    ))}
                    {lowStockItems.length > 5 && (
                      <p className="text-muted">
                        +{lowStockItems.length - 5} more items need restocking
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-warning';
    case 'confirmed':
      return 'bg-info';
    case 'preparing':
      return 'bg-primary';
    case 'ready':
      return 'bg-success';
    case 'completed':
      return 'bg-dark';
    case 'cancelled':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

export default Dashboard;
