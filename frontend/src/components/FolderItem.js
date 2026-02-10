import React from 'react';
import { FaFolder, FaTrash } from 'react-icons/fa';

const FolderItem = ({ folder, onOpen, onDelete }) => {
  return (
    <div style={styles.item}>
      <div style={styles.info} onClick={() => onOpen(folder._id)}>
        <FaFolder style={styles.icon} />
        <span>{folder.name}</span>
      </div>
      <button onClick={() => onDelete(folder._id)} style={styles.actionBtn} title="Delete">
        <FaTrash />
      </button>
    </div>
  );
};

const styles = {
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  info: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 },
  icon: { color: '#5f6368', fontSize: '20px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', fontSize: '16px', padding: '5px' }
};

export default FolderItem;
