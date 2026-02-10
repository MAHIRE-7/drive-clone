import React, { useState } from 'react';
import { FaUpload, FaCheck, FaTimes } from 'react-icons/fa';

const FileUpload = ({ onUpload, currentFolder }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => uploadFile(file));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadFile(file));
    e.target.value = '';
  };

  const uploadFile = async (file) => {
    setUploadProgress({ name: file.name, progress: 0, status: 'uploading' });
    
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress({ name: file.name, progress: i, status: 'uploading' });
      }
      
      await onUpload(file);
      setUploadProgress({ name: file.name, progress: 100, status: 'success' });
      setTimeout(() => setUploadProgress(null), 2000);
    } catch (error) {
      setUploadProgress({ name: file.name, progress: 0, status: 'error' });
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.dropZone,
          ...(isDragging ? styles.dropZoneActive : {})
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FaUpload size={24} style={styles.uploadIcon} />
        <p style={styles.dropText}>
          Drop files here or{' '}
          <label style={styles.browseLink}>
            browse
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={styles.hiddenInput}
            />
          </label>
        </p>
      </div>

      {uploadProgress && (
        <div style={styles.progressContainer}>
          <div style={styles.progressHeader}>
            <span style={styles.fileName}>{uploadProgress.name}</span>
            {uploadProgress.status === 'success' && <FaCheck color="#34a853" />}
            {uploadProgress.status === 'error' && <FaTimes color="#ea4335" />}
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${uploadProgress.progress}%`,
                background: uploadProgress.status === 'error' ? '#ea4335' : '#1a73e8'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    margin: '16px 0'
  },
  dropZone: {
    border: '2px dashed #dadce0',
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center',
    background: '#fff',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  dropZoneActive: {
    borderColor: '#1a73e8',
    background: '#e8f0fe'
  },
  uploadIcon: {
    color: '#5f6368',
    marginBottom: '16px'
  },
  dropText: {
    color: '#5f6368',
    fontSize: '14px',
    margin: 0
  },
  browseLink: {
    color: '#1a73e8',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  hiddenInput: {
    display: 'none'
  },
  progressContainer: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '8px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  fileName: {
    fontSize: '14px',
    color: '#202124',
    fontWeight: '500'
  },
  progressBar: {
    height: '4px',
    background: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  }
};

export default FileUpload;