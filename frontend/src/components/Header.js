import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProfileSettings from '../components/ProfileSettings';
import { FaSignOutAlt, FaCog, FaUser, FaQuestionCircle } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.title}>Drive Clone</h1>
        <div style={styles.userSection}>
          <div style={styles.avatarContainer} onClick={() => setShowUserMenu(!showUserMenu)}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {showUserMenu && (
              <div style={styles.userDropdown}>
                <div style={styles.userInfo}>
                  <div style={styles.avatarLarge}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userName}>{user?.name}</div>
                  <div style={styles.userEmail}>{user?.email}</div>
                </div>
                <div style={styles.menuItems}>
                  <button onClick={() => { setShowSettings(true); setShowUserMenu(false); }} style={styles.menuItem}>
                    <FaUser /> My Account
                  </button>
                  <button onClick={() => { setShowSettings(true); setShowUserMenu(false); }} style={styles.menuItem}>
                    <FaCog /> Settings
                  </button>
                  <button style={styles.menuItem}>
                    <FaQuestionCircle /> Help
                  </button>
                </div>
                <div style={styles.menuDivider}></div>
                <button onClick={logout} style={styles.signOutBtn}>
                  <FaSignOutAlt /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <ProfileSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};

const styles = {
  header: { 
    background: '#4285f4', 
    color: 'white', 
    padding: '15px 30px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    position: 'relative'
  },
  title: { margin: 0, fontSize: '24px' },
  userSection: { position: 'relative' },
  avatarContainer: { 
    position: 'relative',
    cursor: 'pointer'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background 0.2s ease'
  },
  userDropdown: {
    position: 'absolute',
    right: 0,
    top: '50px',
    width: '320px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '16px',
    zIndex: 1000,
    color: '#202124'
  },
  userInfo: {
    textAlign: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '16px'
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#1a73e8',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '500',
    margin: '0 auto 16px'
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  userEmail: {
    fontSize: '14px',
    color: '#5f6368'
  },
  menuItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px'
  },
  menuItem: {
    background: 'none',
    border: 'none',
    padding: '12px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#202124',
    transition: 'background 0.2s ease'
  },
  menuDivider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '8px 0'
  },
  signOutBtn: {
    width: '100%',
    background: 'none',
    border: '1px solid #dadce0',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#202124',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }
};

export default Header;
