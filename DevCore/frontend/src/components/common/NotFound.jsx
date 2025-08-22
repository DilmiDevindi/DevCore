// frontend/src/components/common/NotFound.js
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <i className="fas fa-search fa-4x text-muted mb-3"></i>
      <h2>Page Not Found</h2>
      <p className="lead">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
};
export default NotFound;