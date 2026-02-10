import React, { useState, useEffect } from 'react';
import { FaClock, FaDownload, FaRestore, FaTrash } from 'react-icons/fa';

const FileVersions = ({ fileId, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [fileId]);

  const loadVersions = async () => {
    try {
      // Mock data - replace with actual API call
      setVersions([
        { id: '1', version: '1.3', date: new Date(), size: 1024000, current: true },
        { id: '2', version: '1.2', date: new Date(Date.now() - 86400000), size: 1020000 },
        { id: '3', version: '1.1', date: new Date(Date.now() - 172800000), size: 1015000 },
        { id: '4', version: '1.0', date: new Date(Date.now() - 259200000), size: 1000000 }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Version History</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loading}>Loading versions...</div>
          ) : (
            <div style={styles.versions}>
              {versions.map(version => (
                <div key={version.id} style={styles.version}>
                  <div style={styles.versionInfo}>
                    <div style={styles.versionHeader}>
                      <span style={styles.versionNumber}>v{version.version}</span>
                      {version.current && <span style={styles.currentBadge}>Current</span>}
                    </div>
                    <div style={styles.versionMeta}>
                      <FaClock size={12} style={styles.clockIcon} />
                      {formatDate(version.date)} • {formatBytes(version.size)}
                    </div>
                  </div>
                  <div style={styles.versionActions}>
                    <button style={styles.actionBtn} title="Download">
                      <FaDownload />
                    </button>
                    {!version.current && (
                      <button style={styles.actionBtn} title="Restore">
                        <FaRestore />
                      </button>
                    )}
                    {!version.current && (
                      <button style={styles.actionBtn} title="Delete version">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    width: '500px',
    maxHeight: '600px',
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
    fontSize: '18px',
    fontWeight: '500'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '4px'
  },
  content: {
    flex: 1,
    overflow: 'auto'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#5f6368'
  },
  versions: {
    padding: '16px'
  },
  version: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    transition: 'background 0.2s ease'
  },
  versionInfo: {
    flex: 1
  },
  versionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  versionNumber: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124'
  },
  currentBadge: {
    background: '#e8f0fe',
    color: '#1a73e8',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  versionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#5f6368'
  },
  clockIcon: {
    color: '#5f6368'
  },
  versionActions: {
    display: 'flex',
    gap: '4px'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#5f6368',
    fontSize: '14px',
    transition: 'background 0.2s ease'
  }
};

export default FileVersions;