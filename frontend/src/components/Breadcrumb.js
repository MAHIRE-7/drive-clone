import React from 'react';
import { FaChevronRight, FaGoogleDrive } from 'react-icons/fa';

const Breadcrumb = ({ path, onNavigate }) => {
  return (
    <div style={styles.breadcrumb}>
      <button style={styles.crumb} onClick={() => onNavigate(null)}>
        <FaGoogleDrive style={styles.icon} />
        My Drive
      </button>
      {path && path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <FaChevronRight style={styles.separator} />
          <button style={styles.crumb} onClick={() => onNavigate(folder.id)}>
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const styles = {
  breadcrumb: { display: 'flex', alignItems: 'center', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e0e0e0' },
  crumb: { background: 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '14px', color: '#202124', display: 'flex', alignItems: 'center', borderRadius: '4px', fontWeight: '400' },
  icon: { marginRight: '8px', fontSize: '16px', color: '#5f6368' },
  separator: { fontSize: '12px', color: '#5f6368', margin: '0 4px' }
};

export default Breadcrumb;
