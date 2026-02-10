import React, { useState, useEffect } from 'react';
import { FaClock, FaFile, FaImage, FaFilePdf } from 'react-icons/fa';

const RecentFiles = ({ onFileClick }) => {
  const [recentFiles, setRecentFiles] = useState([]);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = () => {
    // Get from localStorage or API
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    setRecentFiles(recent.slice(0, 10)); // Show last 10
  };

  const addToRecent = (file) => {
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    const filtered = recent.filter(f => f._id !== file._id);
    const updated = [{ ...file, accessedAt: new Date() }, ...filtered].slice(0, 20);
    localStorage.setItem('recentFiles', JSON.stringify(updated));
    setRecentFiles(updated.slice(0, 10));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FaImage color="#ea4335" />;
    if (mimeType?.includes('pdf')) return <FaFilePdf color="#ea4335" />;
    return <FaFile color="#5f6368" />;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  if (recentFiles.length === 0) {
    return (
      <div style={styles.empty}>
        <FaClock size={48} style={styles.emptyIcon} />
        <p style={styles.emptyText}>No recent files</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Recent</h3>
      <div style={styles.fileList}>
        {recentFiles.map(file => (
          <div 
            key={file._id} 
            style={styles.fileItem}
            onClick={() => {
              onFileClick(file);
              addToRecent(file);
            }}
          >
            <div style={styles.fileIcon}>
              {getFileIcon(file.mimeType)}
            </div>
            <div style={styles.fileInfo}>
              <div style={styles.fileName}>{file.originalName}</div>
              <div style={styles.fileDate}>
                {formatDate(file.accessedAt || file.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 16px 0',
    color: '#202124'
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  fileIcon: {
    marginRight: '12px',
    fontSize: '20px'
  },
  fileInfo: {
    flex: 1
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#202124',
    marginBottom: '2px'
  },
  fileDate: {
    fontSize: '12px',
    color: '#5f6368'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#5f6368'
  },
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '14px',
    margin: 0
  }
};

export default RecentFiles;