import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../api/api';
import Loader from '../common/Loader';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading order details..." />;
  if (!order) return <div className="container py-5 text-center"><h3>Order not found</h3></div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
              <h2 className="text-success mb-3">Order Confirmed!</h2>
              <p className="lead">Thank you for your order. Your order has been placed successfully.</p>
              
              <div className="order-details mt-4">
                <h4>Order #{order.orderNumber}</h4>
                <p><strong>Total Amount:</strong> Rs. {order.totalAmount.toFixed(2)}</p>
                <p><strong>Order Type:</strong> {order.orderType}</p>
                <p><strong>Estimated Ready Time:</strong> {new Date(order.estimatedReadyTime).toLocaleTimeString()}</p>
                
                {order.qrCode && (
                  <div className="mt-3">
                    <h6>QR Code for Express Pickup:</h6>
                    <div className="qr-code-placeholder bg-light p-3 d-inline-block">
                      {order.qrCode}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Link to="/customer/orders" className="btn btn-primary me-2">
                  View My Orders
                </Link>
                <Link to="/customer/menu" className="btn btn-outline-primary">
                  Order Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderConfirmation;