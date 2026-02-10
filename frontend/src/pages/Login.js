import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.logoContainer}>
          <svg width="48" height="48" viewBox="0 0 40 40">
            <path fill="#4285F4" d="M20 0L8 12h24z"/>
            <path fill="#34A853" d="M8 12L0 28l8 12z"/>
            <path fill="#FBBC04" d="M32 12l8 16-8 12z"/>
            <path fill="#EA4335" d="M8 40h24l-12-12z"/>
          </svg>
        </div>
        <h2 style={styles.title}>Sign in to Drive</h2>
        {error && <div style={styles.error}>{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f3f4' },
  form: { background: 'white', padding: '48px 40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '400px', border: '1px solid #dadce0' },
  logoContainer: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  title: { textAlign: 'center', fontSize: '24px', fontWeight: '400', marginBottom: '24px', color: '#202124' },
  input: { width: '100%', padding: '14px 16px', margin: '10px 0', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box', fontSize: '16px', outline: 'none' },
  button: { width: '100%', padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '16px', fontSize: '14px', fontWeight: '500' },
  error: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px' }
};

export default Login;
