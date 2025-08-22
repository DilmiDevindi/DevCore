// frontend/src/components/customer/QRExpressPickup.js
const QRExpressPickup = () => {
  return (
    <div className="container py-4">
      <div className="text-center">
        <h2><i className="fas fa-qrcode me-2"></i>QR Express Pickup</h2>
        <p className="lead">Scan QR code for quick order pickup</p>
        
        <div className="mt-4">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            QR Express Pickup feature coming soon!
          </div>
        </div>
      </div>
    </div>
  );
};
export default QRExpressPickup;