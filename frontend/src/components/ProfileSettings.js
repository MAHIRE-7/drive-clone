import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaCog, FaLock, FaBell, FaEye, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';

const ProfileSettings = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    autoSave: true,
    defaultView: 'grid'
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await updateProfile(profileData);
      localStorage.setItem('userSettings', JSON.stringify(settings));
      onClose();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const exportData = () => {
    const data = {
      profile: user,
      files: JSON.parse(localStorage.getItem('recentFiles') || '[]'),
      starred: JSON.parse(localStorage.getItem('starredFiles') || '[]'),
      activities: JSON.parse(localStorage.getItem('activities') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drive-data-export.json';
    a.click();
  };

  const clearData = () => {
    if (confirm('Clear all local data? This cannot be undone.')) {
      localStorage.removeItem('recentFiles');
      localStorage.removeItem('starredFiles');
      localStorage.removeItem('activities');
      localStorage.removeItem('userSettings');
      alert('Data cleared successfully');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.content}>
          <div style={styles.sidebar}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{...styles.tabBtn, ...(activeTab === 'profile' ? styles.tabActive : {})}}
            >
              <FaUser /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              style={{...styles.tabBtn, ...(activeTab === 'preferences' ? styles.tabActive : {})}}
            >
              <FaCog /> Preferences
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              style={{...styles.tabBtn, ...(activeTab === 'security' ? styles.tabActive : {})}}
            >
              <FaLock /> Security
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              style={{...styles.tabBtn, ...(activeTab === 'privacy' ? styles.tabActive : {})}}
            >
              <FaEye /> Privacy
            </button>
          </div>

          <div style={styles.main}>
            {activeTab === 'profile' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Profile Information</h3>
                <div style={styles.field}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.storageInfo}>
                  <h4 style={styles.storageTitle}>Storage Usage</h4>
                  <div style={styles.storageBar}>
                    <div style={styles.storageUsed}></div>
                  </div>
                  <p style={styles.storageText}>2.1 GB of 15 GB used</p>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Preferences</h3>
                <div style={styles.setting}>
                  <label style={styles.settingLabel}>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    />
                    Enable notifications
                  </label>
                </div>
                <div style={styles.setting}>
                  <label style={styles.settingLabel}>
                    <input
                      type="checkbox"
                      checked={settings.emailUpdates}
                      onChange={(e) => setSettings({...settings, emailUpdates: e.target.checked})}
                    />
                    Email updates
                  </label>
                </div>
                <div style={styles.setting}>
                  <label style={styles.settingLabel}>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                    />
                    Auto-save changes
                  </label>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Default view</label>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => setSettings({...settings, defaultView: e.target.value})}
                    style={styles.select}
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Security</h3>
                <div style={styles.field}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Privacy & Data</h3>
                <div style={styles.actionGroup}>
                  <button onClick={exportData} style={styles.actionBtn}>
                    <FaDownload /> Export Data
                  </button>
                  <button onClick={clearData} style={styles.dangerBtn}>
                    <FaTrash /> Clear Local Data
                  </button>
                </div>
                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    Export your data to download a copy of your files and settings.
                    Clear local data removes cached files and preferences from this device.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    background: '#fff',
    borderRadius: '8px',
    width: '800px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '500'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#5f6368'
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  sidebar: {
    width: '200px',
    background: '#f8f9fa',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '12px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#5f6368'
  },
  tabActive: {
    background: '#e8f0fe',
    color: '#1a73e8'
  },
  main: {
    flex: 1,
    padding: '24px',
    overflow: 'auto'
  },
  section: {
    maxWidth: '400px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '20px',
    color: '#202124'
  },
  field: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#202124'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px'
  },
  setting: {
    marginBottom: '12px'
  },
  settingLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  storageInfo: {
    marginTop: '24px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  storageTitle: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px'
  },
  storageBar: {
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  storageUsed: {
    width: '14%',
    height: '100%',
    background: '#1a73e8'
  },
  storageText: {
    fontSize: '12px',
    color: '#5f6368',
    margin: 0
  },
  actionGroup: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  actionBtn: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  dangerBtn: {
    background: '#ea4335',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  infoBox: {
    background: '#e8f0fe',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #d2e3fc'
  },
  infoText: {
    fontSize: '13px',
    color: '#1a73e8',
    margin: 0
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid #dadce0',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveBtn: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default ProfileSettings;