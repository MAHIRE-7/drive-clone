import React from 'react';
import { FaTimes, FaDownload, FaUserPlus, FaTrash, FaImage } from 'react-icons/fa';

const FilePreview = ({ file, onClose, onDownload, onShare, onDelete }) => {
  const isImage = file.mimeType?.startsWith('image/');
  const isPdf = file.mimeType?.includes('pdf');

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.fileName}>{file.originalName}</div>
          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={() => onDownload(file._id, file.originalName)}>
              <FaDownload />
            </button>
            <button style={styles.actionBtn} onClick={() => onShare(file._id)}>
              <FaUserPlus />
            </button>
            <button style={styles.actionBtn} onClick={() => onDelete(file._id)}>
              <FaTrash />
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>
        <div style={styles.content}>
          {isImage ? (
            <div style={styles.noPreview}>
              <FaImage size={64} color="#5f6368" />
              <div style={styles.noPreviewText}>Image preview</div>
              <button style={styles.downloadBtn} onClick={() => onDownload(file._id, file.originalName)}>
                <FaDownload style={{marginRight: '8px'}} />
                Download to view
              </button>
            </div>
          ) : isPdf ? (
            <div style={styles.noPreview}>
              <div style={styles.noPreviewText}>PDF preview not available</div>
              <button style={styles.downloadBtn} onClick={() => onDownload(file._id, file.originalName)}>
                <FaDownload style={{marginRight: '8px'}} />
                Download to view
              </button>
            </div>
          ) : (
            <div style={styles.noPreview}>
              <div style={styles.noPreviewText}>No preview available</div>
              <button style={styles.downloadBtn} onClick={() => onDownload(file._id, file.originalName)}>
                <FaDownload style={{marginRight: '8px'}} />
                Download to view
              </button>
            </div>
          )}
        </div>
        <div style={styles.footer}>
          <div style={styles.fileInfo}>
            <span>Type: {file.mimeType}</span>
            <span style={{marginLeft: '24px'}}>Size: {(file.size / 1024).toFixed(2)} KB</span>
            <span style={{marginLeft: '24px'}}>Modified: {new Date(file.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: '8px', width: '90%', maxWidth: '1200px', height: '90%', display: 'flex', flexDirection: 'column' },
  header: { padding: '16px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fileName: { fontSize: '18px', fontWeight: '500', color: '#202124' },
  actions: { display: 'flex', gap: '8px' },
  actionBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f1f3f4' },
  image: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  noPreview: { textAlign: 'center' },
  noPreviewText: { fontSize: '18px', color: '#5f6368', marginBottom: '24px' },
  downloadBtn: { padding: '12px 24px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center' },
  footer: { padding: '16px 24px', borderTop: '1px solid #e0e0e0' },
  fileInfo: { fontSize: '13px', color: '#5f6368' }
};

export default FilePreview;
