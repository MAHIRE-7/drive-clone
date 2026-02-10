import React, { useState } from 'react';
import { FaDownload, FaUserPlus, FaTrash, FaStar, FaCopy, FaEdit, FaInfoCircle } from 'react-icons/fa';

const ContextMenu = ({ x, y, onClose, item, onDownload, onShare, onDelete, onRename, onStar }) => {
  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={{...styles.menu, left: x, top: y}}>
        {item.type === 'file' && (
          <button style={styles.menuItem} onClick={() => { onDownload(item.id, item.name); onClose(); }}>
            <FaDownload style={styles.menuIcon} />
            Download
          </button>
        )}
        <button style={styles.menuItem} onClick={() => { onShare(item.id); onClose(); }}>
          <FaUserPlus style={styles.menuIcon} />
          Share
        </button>
        <button style={styles.menuItem} onClick={() => { onStar && onStar(item.id); onClose(); }}>
          <FaStar style={styles.menuIcon} />
          Add to starred
        </button>
        <button style={styles.menuItem} onClick={() => { onRename(item.id); onClose(); }}>
          <FaEdit style={styles.menuIcon} />
          Rename
        </button>
        <div style={styles.divider} />
        <button style={styles.menuItem} onClick={() => { onDelete(item.id); onClose(); }}>
          <FaTrash style={styles.menuIcon} />
          Remove
        </button>
        <div style={styles.divider} />
        <button style={styles.menuItem}>
          <FaInfoCircle style={styles.menuIcon} />
          File information
        </button>
      </div>
    </>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  menu: { position: 'fixed', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', padding: '8px 0', minWidth: '200px', zIndex: 1000 },
  menuItem: { width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#202124', display: 'flex', alignItems: 'center', transition: 'background 0.2s' },
  menuIcon: { marginRight: '12px', fontSize: '16px', color: '#5f6368' },
  divider: { height: '1px', background: '#e0e0e0', margin: '8px 0' }
};

export default ContextMenu;
