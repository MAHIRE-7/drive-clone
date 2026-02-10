import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const StorageBar = () => {
  const { user } = useContext(AuthContext);
  const totalStorage = 15 * 1024 * 1024 * 1024;
  const usedStorage = user?.storageUsed || 0;
  const percentage = (usedStorage / totalStorage) * 100;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div style={{...styles.progress, width: `${percentage}%`}}></div>
      </div>
      <div style={styles.text}>
        {formatBytes(usedStorage)} of {formatBytes(totalStorage)} used
      </div>
    </div>
  );
};

const styles = {
  container: { position: 'fixed', bottom: '16px', left: '16px', background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', width: '240px' },
  progressBar: { height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' },
  progress: { height: '100%', background: '#1a73e8', transition: 'width 0.3s' },
  text: { fontSize: '12px', color: '#5f6368' }
};

export default StorageBar;
