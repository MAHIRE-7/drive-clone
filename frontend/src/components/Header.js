import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Drive Clone</h1>
      <div style={styles.userInfo}>
        <span>{user?.name}</span>
        <button onClick={logout} style={styles.logoutBtn}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: { background: '#4285f4', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '24px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }
};

export default Header;
