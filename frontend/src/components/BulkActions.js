import React, { useState } from 'react';
import { FaDownload, FaTrash, FaShare, FaFolder, FaCopy } from 'react-icons/fa';

const BulkActions = ({ selectedFiles, onBulkDownload, onBulkDelete, onBulkMove, onBulkShare, onClearSelection }) => {
  const [showMoveModal, setShowMoveModal] = useState(false);

  if (selectedFiles.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        {selectedFiles.length} item{selectedFiles.length > 1 ? 's' : ''} selected
      </div>
      <div style={styles.actions}>
        <button onClick={onBulkDownload} style={styles.actionBtn} title="Download selected">
          <FaDownload />
        </button>
        <button onClick={() => setShowMoveModal(true)} style={styles.actionBtn} title="Move to folder">
          <FaFolder />
        </button>
        <button onClick={onBulkShare} style={styles.actionBtn} title="Share selected">
          <FaShare />
        </button>
        <button onClick={onBulkDelete} style={styles.actionBtn} title="Delete selected">
          <FaTrash />
        </button>
        <button onClick={onClearSelection} style={styles.clearBtn}>
          Clear
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    padding: '12px 20px',
    borderRadius: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: 1000,
    border: '1px solid #e0e0e0'
  },
  info: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#5f6368',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  },
  clearBtn: {
    background: '#f1f3f4',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#5f6368'
  }
};

export default BulkActions;