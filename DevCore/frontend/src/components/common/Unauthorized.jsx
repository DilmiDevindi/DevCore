// frontend/src/components/common/Unauthorized.js
import { Link } from 'react-router-dom';

const Unauthorized = () => {
return (
    <div className="container py-5 text-center">
        <i className="fas fa-ban fa-4x text-danger mb-3"></i>
        <h2>Access Denied</h2>
        <p className="lead">You don&apos;t have permission to access this page.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
);
};

export default Unauthorized;