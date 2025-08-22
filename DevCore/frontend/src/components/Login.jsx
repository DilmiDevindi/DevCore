import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Added 'Link' here
import axios from 'axios';
import './Login.css';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return; 
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
  email,
  password,
});
      if (response.data.success) {
        navigate('/dashboard');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('Login failed: ' + error);
    }
  };

  return (
    <div className="login-page">
      <div className="container-wrapper-login">
        <div className="info-container">
          
          <h2>Welcome To</h2>
          <p className='logpara'></p>
        </div>
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn">Login</button>
          </form>
          <p className='para'>Don&apos;t have an account? <a href="/signup">Sign up</a></p>

          {/* 🔽 Moved inside the login container for better layout */}
          <div className="mt-2 text-center">
          <Link to="/forgot-password" className="forgot-password-link">
          
        </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
