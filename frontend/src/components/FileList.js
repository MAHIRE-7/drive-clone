import React from 'react';
import { FaFolder, FaFile, FaDownload, FaTrash, FaShare } from 'react-icons/fa';
import { format } from 'date-fns';

const FileList = ({ folders, files, onFolderOpen, onFolderDelete, onFileDownload, onFileDelete, onFileShare, isSharedView }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.colName}>Name</div>
        <div style={styles.colOwner}>Owner</div>
        <div style={styles.colModified}>Last modified</div>
        <div style={styles.colSize}>File size</div>
      </div>
      
      {folders.map(folder => (
        <div key={folder._id} style={styles.row}>
          <div style={styles.colName} onClick={() => onFolderOpen(folder._id)}>
            <FaFolder style={styles.folderIcon} />
            <span>{folder.name}</span>
          </div>
          <div style={styles.colOwner}>me</div>
          <div style={styles.colModified}>{format(new Date(folder.createdAt), 'MMM d, yyyy')}</div>
          <div style={styles.colSize}>-</div>
          <button onClick={() => onFolderDelete(folder._id)} style={styles.actionBtn}>
            <FaTrash />
          </button>
        </div>
      ))}
      
      {files.map(file => (
        <div key={file._id} style={styles.row}>
          <div style={styles.colName}>
            <FaFile style={styles.fileIcon} />
            <span>{file.originalName}</span>
          </div>
          <div style={styles.colOwner}>{isSharedView && file.owner ? file.owner.name : 'me'}</div>
          <div style={styles.colModified}>{format(new Date(file.createdAt), 'MMM d, yyyy')}</div>
          <div style={styles.colSize}>{(file.size / 1024).toFixed(2)} KB</div>
          <div style={styles.actions}>
            <button onClick={() => onFileDownload(file._id, file.originalName)} style={styles.actionBtn}>
              <FaDownload />
            </button>
            <button onClick={() => onFileShare(file._id)} style={styles.actionBtn}>
              <FaShare />
            </button>
            <button onClick={() => onFileDelete(file._id)} style={styles.actionBtn}>
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: { background: 'white', borderRadius: '8px', overflow: 'hidden' },
  header: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', fontSize: '12px', fontWeight: '500', color: '#5f6368' },
  row: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #f1f3f4', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' },
  colName: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#202124' },
  colOwner: { fontSize: '13px', color: '#5f6368' },
  colModified: { fontSize: '13px', color: '#5f6368' },
  colSize: { fontSize: '13px', color: '#5f6368' },
  folderIcon: { fontSize: '20px', color: '#5f6368' },
  fileIcon: { fontSize: '20px', color: '#5f6368' },
  actions: { display: 'flex', gap: '8px' },
  actionBtn: { background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: '#5f6368', fontSize: '14px', borderRadius: '4px' }
};

export default FileList;
