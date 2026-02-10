import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarButton = ({ fileId, isStarred: initialStarred, onToggle }) => {
  const [isStarred, setIsStarred] = useState(initialStarred);

  const handleToggle = async (e) => {
    e.stopPropagation();
    try {
      const newStarred = !isStarred;
      setIsStarred(newStarred);
      
      // Update localStorage
      const starred = JSON.parse(localStorage.getItem('starredFiles') || '[]');
      if (newStarred) {
        starred.push(fileId);
      } else {
        const index = starred.indexOf(fileId);
        if (index > -1) starred.splice(index, 1);
      }
      localStorage.setItem('starredFiles', JSON.stringify(starred));
      
      onToggle?.(fileId, newStarred);
    } catch (error) {
      setIsStarred(!isStarred); // Revert on error
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={styles.starButton}
      title={isStarred ? 'Remove from starred' : 'Add to starred'}
    >
      {isStarred ? (
        <FaStar style={styles.starredIcon} />
      ) : (
        <FaRegStar style={styles.unstarredIcon} />
      )}
    </button>
  );
};

export const StarredFiles = ({ files, onFileClick }) => {
  const [starredFileIds, setStarredFileIds] = useState([]);

  useEffect(() => {
    const starred = JSON.parse(localStorage.getItem('starredFiles') || '[]');
    setStarredFileIds(starred);
  }, []);

  const starredFiles = files.filter(file => starredFileIds.includes(file._id));

  if (starredFiles.length === 0) {
    return (
      <div style={styles.empty}>
        <FaStar size={48} style={styles.emptyIcon} />
        <p style={styles.emptyText}>No starred files</p>
        <p style={styles.emptySubtext}>Star files to find them quickly</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {starredFiles.map(file => (
          <div 
            key={file._id} 
            style={styles.fileCard}
            onClick={() => onFileClick(file)}
          >
            <div style={styles.cardHeader}>
              <div style={styles.fileIcon}>📄</div>
              <StarButton 
                fileId={file._id} 
                isStarred={true}
                onToggle={() => {
                  const updated = starredFileIds.filter(id => id !== file._id);
                  setStarredFileIds(updated);
                }}
              />
            </div>
            <div style={styles.fileName}>{file.originalName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  starredIcon: {
    color: '#fbbc04',
    fontSize: '16px'
  },
  unstarredIcon: {
    color: '#5f6368',
    fontSize: '16px'
  },
  container: {
    padding: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  fileCard: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  fileIcon: {
    fontSize: '24px'
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#202124',
    wordBreak: 'break-word'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368'
  },
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 8px 0'
  },
  emptySubtext: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.8
  }
};

export default StarButton;