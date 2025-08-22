// frontend/src/components/common/Loader.js
import './Loader.css';

// eslint-disable-next-line react/prop-types
const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loader-small';
      case 'large':
        return 'loader-large';
      default:
        return 'loader-medium';
    }
  };

  return (
    <div className="loader-container">
      <div className={`loader ${getSizeClass()}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;