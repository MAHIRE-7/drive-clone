import React from 'react';
import { FaClock, FaImage } from 'react-icons/fa';

const QuickAccess = ({ files, onFileClick }) => {
  const recentFiles = files.slice(0, 5);

  if (recentFiles.length === 0) return null;

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <FaClock style={styles.icon} />
        <span style={styles.title}>Quick access</span>
      </div>
      <div style={styles.grid}>
        {recentFiles.map(file => (
          <div key={file._id} style={styles.card} onClick={() => onFileClick(file)}>
            <div style={styles.thumbnail}>
              {file.mimeType?.startsWith('image/') ? (
                <div style={styles.imagePlaceholder}>
                  <FaImage size={32} color="#5f6368" />
                </div>
              ) : (
                <div style={styles.placeholder}>{file.originalName.split('.').pop().toUpperCase()}</div>
              )}
            </div>
            <div style={styles.fileName}>{file.originalName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: { marginBottom: '32px' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '16px' },
  icon: { fontSize: '20px', color: '#5f6368', marginRight: '12px' },
  title: { fontSize: '14px', fontWeight: '500', color: '#202124' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' },
  thumbnail: { height: '120px', background: '#f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { fontSize: '24px', fontWeight: '500', color: '#5f6368' },
  fileName: { padding: '12px', fontSize: '13px', color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
};

export default QuickAccess;
