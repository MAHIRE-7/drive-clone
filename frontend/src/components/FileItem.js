import React from 'react';
import { FaFile, FaDownload, FaTrash, FaShare } from 'react-icons/fa';

const FileItem = ({ file, onDownload, onDelete, onShare }) => {
  return (
    <div style={styles.item}>
      <div style={styles.info}>
        <FaFile style={styles.icon} />
        <span>{file.originalName}</span>
      </div>
      <div style={styles.actions}>
        <button onClick={() => onDownload(file._id)} style={styles.actionBtn} title="Download">
          <FaDownload />
        </button>
        <button onClick={() => onShare(file._id)} style={styles.actionBtn} title="Share">
          <FaShare />
        </button>
        <button onClick={() => onDelete(file._id)} style={styles.actionBtn} title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const styles = {
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  info: { display: 'flex', alignItems: 'center', gap: '10px' },
  icon: { color: '#5f6368', fontSize: '20px' },
  actions: { display: 'flex', gap: '10px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', fontSize: '16px', padding: '5px' }
};

export default FileItem;
