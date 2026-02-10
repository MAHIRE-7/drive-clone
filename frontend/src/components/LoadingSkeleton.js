import React from 'react';

const LoadingSkeleton = ({ type = 'file', count = 6 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} style={styles.skeleton}>
      <div style={styles.icon}></div>
      <div style={styles.content}>
        <div style={styles.title}></div>
        <div style={styles.subtitle}></div>
      </div>
    </div>
  ));

  return <div style={styles.container}>{skeletons}</div>;
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
    padding: '16px'
  },
  skeleton: {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e0e0e0',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  icon: {
    width: '24px',
    height: '24px',
    background: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '12px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  title: {
    height: '16px',
    background: '#e0e0e0',
    borderRadius: '4px',
    width: '80%'
  },
  subtitle: {
    height: '12px',
    background: '#e0e0e0',
    borderRadius: '4px',
    width: '60%'
  }
};

export default LoadingSkeleton;