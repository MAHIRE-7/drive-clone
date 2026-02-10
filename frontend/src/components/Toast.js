import React, { useState, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <FaCheck />;
      case 'error': return <FaTimes />;
      case 'warning': return <FaExclamationTriangle />;
      default: return <FaCheck />;
    }
  };

  return (
    <div style={{
      ...styles.toast,
      ...styles[type],
      transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: isVisible ? 1 : 0
    }}>
      <div style={styles.icon}>{getIcon()}</div>
      <span style={styles.message}>{message}</span>
      <button onClick={() => setIsVisible(false)} style={styles.closeBtn}>
        <FaTimes size={12} />
      </button>
    </div>
  );
};

const styles = {
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    minWidth: '300px',
    border: '1px solid #e0e0e0'
  },
  success: {
    borderLeft: '4px solid #34a853'
  },
  error: {
    borderLeft: '4px solid #ea4335'
  },
  warning: {
    borderLeft: '4px solid #fbbc04'
  },
  icon: {
    fontSize: '16px',
    color: '#5f6368'
  },
  message: {
    flex: 1,
    fontSize: '14px',
    color: '#202124'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '4px'
  }
};

export default Toast;