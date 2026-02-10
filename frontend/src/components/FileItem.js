import React from 'react';
import { FaFile, FaDownload, FaTrash, FaShare, FaFolder, FaImage, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';

const FileItem = ({ file, onDownload, onDelete, onShare, onPreview, isSelected, onSelect }) => {
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FaImage color="#ea4335" />;
    if (mimeType?.includes('pdf')) return <FaFilePdf color="#ea4335" />;
    if (mimeType?.includes('word')) return <FaFileWord color="#4285f4" />;
    if (mimeType?.includes('sheet')) return <FaFileExcel color="#0f9d58" />;
    return <FaFile color="#5f6368" />;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div 
      style={{
        ...styles.item,
        ...(isSelected ? styles.itemSelected : {})
      }}
      onClick={() => onSelect && onSelect(file._id)}
      onDoubleClick={() => onPreview && onPreview(file)}
    >
      <div style={styles.checkbox}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onSelect && onSelect(file._id)}
          style={styles.checkboxInput}
        />
      </div>
      <div style={styles.info}>
        <div style={styles.icon}>
          {getFileIcon(file.mimeType)}
        </div>
        <div style={styles.details}>
          <span style={styles.fileName}>{file.originalName}</span>
          <span style={styles.fileSize}>{formatBytes(file.size)}</span>
        </div>
      </div>
      <div style={styles.actions}>
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(file._id, file.originalName); }} 
          style={styles.actionBtn} 
          title="Download"
          aria-label="Download file"
        >
          <FaDownload />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onShare(file._id); }} 
          style={styles.actionBtn} 
          title="Share"
          aria-label="Share file"
        >
          <FaShare />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(file._id); }} 
          style={styles.actionBtn} 
          title="Delete"
          aria-label="Delete file"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const styles = {
  item: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 16px', 
    background: '#fff', 
    borderRadius: '8px', 
    marginBottom: '8px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '2px solid transparent'
  },
  itemSelected: {
    background: '#e8f0fe',
    borderColor: '#1a73e8'
  },
  checkbox: {
    marginRight: '12px'
  },
  checkboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  info: { 
    display: 'flex', 
    alignItems: 'center', 
    flex: 1,
    gap: '12px' 
  },
  icon: { 
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124'
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368'
  },
  actions: { 
    display: 'flex', 
    gap: '8px',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  actionBtn: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#5f6368', 
    fontSize: '14px', 
    padding: '8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  }
};

// Add hover effect for actions
const itemHoverStyle = `
  .file-item:hover .file-actions {
    opacity: 1;
  }
  .file-item .file-actions button:hover {
    background: rgba(60, 64, 67, 0.08);
    transform: scale(1.1);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = itemHoverStyle;
  document.head.appendChild(styleSheet);
}

export default FileItem;
