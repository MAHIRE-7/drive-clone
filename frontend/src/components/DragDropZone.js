import React, { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const DragDropZone = ({ onFileDrop, children }) => {
  const [isDragging, setIsDragging] = useState(false);

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
    if (files.length > 0) {
      onFileDrop(files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{position: 'relative', height: '100%'}}
    >
      {children}
      {isDragging && (
        <div style={styles.overlay}>
          <div style={styles.dropZone}>
            <FaCloudUploadAlt style={styles.icon} />
            <div style={styles.text}>Drop files to upload</div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropZone: { textAlign: 'center' },
  icon: { fontSize: '64px', color: '#1a73e8', marginBottom: '16px' },
  text: { fontSize: '24px', color: '#202124', fontWeight: '400' }
};

export default DragDropZone;
