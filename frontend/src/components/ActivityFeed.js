import React, { useState, useEffect } from 'react';
import { FaUpload, FaDownload, FaShare, FaTrash, FaEdit, FaClock } from 'react-icons/fa';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    // Get from localStorage or API
    const stored = JSON.parse(localStorage.getItem('activities') || '[]');
    setActivities(stored.slice(0, 20)); // Show last 20 activities
  };

  const addActivity = (type, fileName, details = '') => {
    const activity = {
      id: Date.now(),
      type,
      fileName,
      details,
      timestamp: new Date(),
      user: 'You'
    };

    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const updated = [activity, ...activities].slice(0, 50); // Keep last 50
    localStorage.setItem('activities', JSON.stringify(updated));
    setActivities(updated.slice(0, 20));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return <FaUpload color="#34a853" />;
      case 'download': return <FaDownload color="#4285f4" />;
      case 'share': return <FaShare color="#fbbc04" />;
      case 'delete': return <FaTrash color="#ea4335" />;
      case 'edit': return <FaEdit color="#9aa0a6" />;
      default: return <FaClock color="#5f6368" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'upload': return `uploaded ${activity.fileName}`;
      case 'download': return `downloaded ${activity.fileName}`;
      case 'share': return `shared ${activity.fileName}`;
      case 'delete': return `deleted ${activity.fileName}`;
      case 'edit': return `modified ${activity.fileName}`;
      default: return `${activity.type} ${activity.fileName}`;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div style={styles.empty}>
        <FaClock size={48} style={styles.emptyIcon} />
        <p style={styles.emptyText}>No recent activity</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Recent Activity</h3>
      <div style={styles.activityList}>
        {activities.map(activity => (
          <div key={activity.id} style={styles.activityItem}>
            <div style={styles.activityIcon}>
              {getActivityIcon(activity.type)}
            </div>
            <div style={styles.activityContent}>
              <div style={styles.activityText}>
                <span style={styles.userName}>{activity.user}</span>{' '}
                {getActivityText(activity)}
              </div>
              <div style={styles.activityTime}>
                {formatTime(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export function to add activities from other components
export const addActivity = (type, fileName, details = '') => {
  const activity = {
    id: Date.now(),
    type,
    fileName,
    details,
    timestamp: new Date(),
    user: 'You'
  };

  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const updated = [activity, ...activities].slice(0, 50);
  localStorage.setItem('activities', JSON.stringify(updated));
  
  // Dispatch custom event to update activity feed
  window.dispatchEvent(new CustomEvent('activityAdded', { detail: activity }));
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 16px 0',
    color: '#202124'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  activityIcon: {
    fontSize: '16px',
    marginTop: '2px'
  },
  activityContent: {
    flex: 1
  },
  activityText: {
    fontSize: '14px',
    color: '#202124',
    marginBottom: '2px'
  },
  userName: {
    fontWeight: '500'
  },
  activityTime: {
    fontSize: '12px',
    color: '#5f6368'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#5f6368'
  },
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '14px',
    margin: 0
  }
};

export default ActivityFeed;