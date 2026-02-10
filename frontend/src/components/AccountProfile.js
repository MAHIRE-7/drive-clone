import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaCamera, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const AccountProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  const handleSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || ''
    });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Handle avatar upload
        console.log('Avatar uploaded:', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" style={styles.avatarImg} />
            ) : (
              <span style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
            <label style={styles.avatarOverlay}>
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={styles.hiddenInput}
              />
            </label>
          </div>
        </div>

        <div style={styles.actions}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <div style={styles.editActions}>
              <button onClick={handleSave} style={styles.saveBtn}>
                <FaCheck /> Save
              </button>
              <button onClick={handleCancel} style={styles.cancelBtn}>
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              style={styles.input}
            />
          ) : (
            <div style={styles.value}>{profileData.name}</div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          {isEditing ? (
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              style={styles.input}
            />
          ) : (
            <div style={styles.value}>{profileData.email}</div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Bio</label>
          {isEditing ? (
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              style={styles.textarea}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div style={styles.value}>{profileData.bio || 'No bio added'}</div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Location</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              style={styles.input}
              placeholder="City, Country"
            />
          ) : (
            <div style={styles.value}>{profileData.location || 'Not specified'}</div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Website</label>
          {isEditing ? (
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => setProfileData({...profileData, website: e.target.value})}
              style={styles.input}
              placeholder="https://example.com"
            />
          ) : (
            <div style={styles.value}>
              {profileData.website ? (
                <a href={profileData.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {profileData.website}
                </a>
              ) : (
                'No website'
              )}
            </div>
          )}
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statValue}>156</div>
          <div style={styles.statLabel}>Files</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>23</div>
          <div style={styles.statLabel}>Folders</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>2.1 GB</div>
          <div style={styles.statLabel}>Used</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  avatarSection: {
    position: 'relative'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#1a73e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarText: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: '500'
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: '#5f6368',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px'
  },
  hiddenInput: {
    display: 'none'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
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
  editActions: {
    display: 'flex',
    gap: '8px'
  },
  saveBtn: {
    background: '#34a853',
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
  cancelBtn: {
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '32px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical'
  },
  value: {
    fontSize: '14px',
    color: '#202124',
    padding: '10px 0'
  },
  link: {
    color: '#1a73e8',
    textDecoration: 'none'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px 0',
    borderTop: '1px solid #e0e0e0'
  },
  stat: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#5f6368',
    textTransform: 'uppercase'
  }
};

export default AccountProfile;