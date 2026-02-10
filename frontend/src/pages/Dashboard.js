import React, { useState, useEffect, useContext } from 'react';
import { files, folders } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaSearch, FaCog, FaQuestionCircle, FaGoogleDrive, FaUsers, FaClock, FaStar, FaTrash, FaCloud, FaFolder, FaFile, FaEllipsisV, FaTh, FaList, FaPlus, FaUpload, FaFolderPlus, FaDownload, FaUserPlus, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [fileList, setFileList] = useState([]);
  const [folderList, setFolderList] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentView, setCurrentView] = useState('myDrive');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentFolder, currentView]);

  const loadData = async () => {
    try {
      if (currentView === 'shared') {
        const res = await files.getShared();
        setSharedFiles(res.data);
      } else {
        const [filesRes, foldersRes] = await Promise.all([
          files.getAll(currentFolder),
          folders.getAll(currentFolder)
        ]);
        setFileList(filesRes.data);
        setFolderList(foldersRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder) formData.append('folderId', currentFolder);
    try {
      await files.upload(formData);
      loadData();
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleDownload = async (id, name) => {
    try {
      const res = await files.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await files.delete(id);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleShare = async (id) => {
    const email = prompt('Enter email to share with:');
    if (!email) return;
    try {
      await files.share(id, email);
      alert('File shared successfully');
    } catch (err) {
      alert('Share failed');
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;
    try {
      await folders.create({ name, parentId: currentFolder });
      loadData();
    } catch (err) {
      alert('Create folder failed');
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm('Delete this folder?')) return;
    try {
      await folders.delete(id);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getFileIcon = (mimeType, size = 24) => {
    const iconStyle = { fontSize: `${size}px` };
    if (mimeType?.startsWith('image/')) return <FaImage style={{...iconStyle, color: '#ea4335'}} />;
    if (mimeType?.includes('pdf')) return <FaFilePdf style={{...iconStyle, color: '#ea4335'}} />;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return <FaFileWord style={{...iconStyle, color: '#4285f4'}} />;
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return <FaFileExcel style={{...iconStyle, color: '#0f9d58'}} />;
    if (mimeType?.startsWith('video/')) return <FaFileVideo style={{...iconStyle, color: '#ff6d00'}} />;
    if (mimeType?.startsWith('audio/')) return <FaFileAudio style={{...iconStyle, color: '#f439a0'}} />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <FaFileArchive style={{...iconStyle, color: '#fbbc04'}} />;
    if (mimeType?.includes('javascript') || mimeType?.includes('python') || mimeType?.includes('java')) return <FaFileCode style={{...iconStyle, color: '#0f9d58'}} />;
    return <FaFile style={{...iconStyle, color: '#5f6368'}} />;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const filteredFiles = currentView === 'shared' ? sharedFiles : fileList;
  const filteredFolders = currentView === 'shared' ? [] : folderList;

  const totalStorage = 15 * 1024 * 1024 * 1024;
  const usedStorage = user?.storageUsed || 0;
  const storagePercent = (usedStorage / totalStorage) * 100;

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <svg width="40" height="40" viewBox="0 0 40 40" style={{marginRight: '8px'}}>
            <path fill="#4285F4" d="M20 2L8 14h24z"/>
            <path fill="#34A853" d="M8 14L2 26l6 12z"/>
            <path fill="#FBBC04" d="M32 14l6 12-6 12z"/>
            <path fill="#EA4335" d="M8 38h24l-12-12z"/>
          </svg>
          <span style={styles.logo}>Drive</span>
        </div>
        <div style={styles.searchContainer}>
          <FaSearch style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search in Drive" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconButton}><FaQuestionCircle size={20} /></button>
          <button style={styles.iconButton}><FaCog size={20} /></button>
          <div style={styles.avatarContainer} onClick={() => setShowUserMenu(!showUserMenu)}>
            <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            {showUserMenu && (
              <div style={styles.userDropdown}>
                <div style={styles.userInfo}>
                  <div style={styles.avatarLarge}>{user?.name?.charAt(0).toUpperCase()}</div>
                  <div style={styles.userName}>{user?.name}</div>
                  <div style={styles.userEmail}>{user?.email}</div>
                </div>
                <button onClick={logout} style={styles.signOutBtn}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={styles.main}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <button onClick={handleCreateFolder} style={styles.newButton}>
            <FaPlus style={{marginRight: '12px'}} />
            New
          </button>
          
          <nav style={styles.nav}>
            <button onClick={() => setCurrentView('myDrive')} style={{...styles.navItem, ...(currentView === 'myDrive' ? styles.navItemActive : {})}}>
              <FaGoogleDrive style={styles.navIcon} />
              <span>My Drive</span>
            </button>
            <button onClick={() => setCurrentView('shared')} style={{...styles.navItem, ...(currentView === 'shared' ? styles.navItemActive : {})}}>
              <FaUsers style={styles.navIcon} />
              <span>Shared with me</span>
            </button>
            <button onClick={() => setCurrentView('recent')} style={styles.navItem}>
              <FaClock style={styles.navIcon} />
              <span>Recent</span>
            </button>
            <button onClick={() => setCurrentView('starred')} style={styles.navItem}>
              <FaStar style={styles.navIcon} />
              <span>Starred</span>
            </button>
            <button onClick={() => setCurrentView('trash')} style={styles.navItem}>
              <FaTrash style={styles.navIcon} />
              <span>Trash</span>
            </button>
          </nav>

          <div style={styles.storageSection}>
            <div style={styles.storageHeader}>
              <FaCloud size={20} />
              <span style={{marginLeft: '12px'}}>Storage</span>
            </div>
            <div style={styles.storageBar}>
              <div style={{...styles.storageProgress, width: `${storagePercent}%`}}></div>
            </div>
            <div style={styles.storageText}>
              {formatBytes(usedStorage)} of {formatBytes(totalStorage)} used
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          <div style={styles.toolbar}>
            <div style={styles.toolbarLeft}>
              <label style={styles.uploadButton}>
                <FaUpload style={{marginRight: '8px'}} />
                Upload
                <input type="file" onChange={handleUpload} style={{display: 'none'}} />
              </label>
            </div>
            <div style={styles.toolbarRight}>
              <button onClick={() => setViewMode('list')} style={{...styles.viewButton, ...(viewMode === 'list' ? styles.viewButtonActive : {})}}>
                <FaList />
              </button>
              <button onClick={() => setViewMode('grid')} style={{...styles.viewButton, ...(viewMode === 'grid' ? styles.viewButtonActive : {})}}>
                <FaTh />
              </button>
            </div>
          </div>

          <div style={styles.contentArea}>
            {viewMode === 'grid' ? (
              <div style={styles.gridView}>
                {filteredFolders.map(folder => (
                  <div key={folder._id} style={styles.gridItem} onDoubleClick={() => setCurrentFolder(folder._id)}>
                    <div style={styles.gridItemHeader}>
                      <FaFolder size={24} color="#5f6368" />
                      <button style={styles.moreButton} onClick={() => handleDeleteFolder(folder._id)}>
                        <FaEllipsisV />
                      </button>
                    </div>
                    <div style={styles.gridItemName}>{folder.name}</div>
                  </div>
                ))}
                {filteredFiles.map(file => (
                  <div key={file._id} style={styles.gridItem}>
                    <div style={styles.gridItemHeader}>
                      {getFileIcon(file.mimeType, 24)}
                      <div style={styles.fileActions}>
                        <button style={styles.actionButton} onClick={() => handleDownload(file._id, file.originalName)}>
                          <FaDownload />
                        </button>
                        <button style={styles.actionButton} onClick={() => handleShare(file._id)}>
                          <FaUserPlus />
                        </button>
                        <button style={styles.actionButton} onClick={() => handleDelete(file._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div style={styles.gridItemName}>{file.originalName}</div>
                    <div style={styles.gridItemMeta}>
                      {currentView === 'shared' && file.owner ? `${file.owner.name} • ` : ''}
                      {formatBytes(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.listView}>
                <div style={styles.listHeader}>
                  <div style={styles.listColName}>Name</div>
                  <div style={styles.listColOwner}>Owner</div>
                  <div style={styles.listColModified}>Last modified</div>
                  <div style={styles.listColSize}>File size</div>
                </div>
                {filteredFolders.map(folder => (
                  <div key={folder._id} style={styles.listRow} onDoubleClick={() => setCurrentFolder(folder._id)}>
                    <div style={styles.listColName}>
                      <FaFolder size={20} color="#5f6368" style={{marginRight: '12px'}} />
                      {folder.name}
                    </div>
                    <div style={styles.listColOwner}>me</div>
                    <div style={styles.listColModified}>{formatDate(folder.createdAt)}</div>
                    <div style={styles.listColSize}>—</div>
                    <button style={styles.listActionButton} onClick={() => handleDeleteFolder(folder._id)}>
                      <FaEllipsisV />
                    </button>
                  </div>
                ))}
                {filteredFiles.map(file => (
                  <div key={file._id} style={styles.listRow}>
                    <div style={styles.listColName}>
                      {getFileIcon(file.mimeType, 20)}
                      <span style={{marginLeft: '12px'}}>{file.originalName}</span>
                    </div>
                    <div style={styles.listColOwner}>{currentView === 'shared' && file.owner ? file.owner.name : 'me'}</div>
                    <div style={styles.listColModified}>{formatDate(file.createdAt)}</div>
                    <div style={styles.listColSize}>{formatBytes(file.size)}</div>
                    <div style={styles.listActions}>
                      <button style={styles.listActionButton} onClick={() => handleDownload(file._id, file.originalName)}>
                        <FaDownload />
                      </button>
                      <button style={styles.listActionButton} onClick={() => handleShare(file._id)}>
                        <FaUserPlus />
                      </button>
                      <button style={styles.listActionButton} onClick={() => handleDelete(file._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  app: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' },
  header: { height: '64px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff' },
  headerLeft: { display: 'flex', alignItems: 'center', marginRight: '24px' },
  logo: { fontSize: '22px', color: '#5f6368', fontWeight: '400' },
  searchContainer: { flex: 1, maxWidth: '720px', height: '48px', background: '#f1f3f4', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 16px' },
  searchIcon: { color: '#5f6368', marginRight: '12px', fontSize: '20px' },
  searchInput: { flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', color: '#202124' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '24px' },
  iconButton: { width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarContainer: { position: 'relative', marginLeft: '8px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#1a73e8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  userDropdown: { position: 'absolute', right: 0, top: '48px', width: '320px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', padding: '16px', zIndex: 1000 },
  userInfo: { textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0', marginBottom: '16px' },
  avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', background: '#1a73e8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '500', margin: '0 auto 16px' },
  userName: { fontSize: '16px', fontWeight: '500', marginBottom: '4px', color: '#202124' },
  userEmail: { fontSize: '14px', color: '#5f6368' },
  signOutBtn: { width: '100%', padding: '10px', background: 'transparent', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', color: '#202124', fontWeight: '500' },
  main: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '256px', borderRight: '1px solid #e0e0e0', padding: '8px', display: 'flex', flexDirection: 'column', background: '#fff' },
  newButton: { margin: '8px', padding: '12px 24px', background: '#fff', border: '1px solid #dadce0', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)', color: '#202124' },
  nav: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem: { padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '0 24px 24px 0', cursor: 'pointer', fontSize: '14px', color: '#202124', display: 'flex', alignItems: 'center', textAlign: 'left', fontWeight: '400' },
  navItemActive: { background: '#e8f0fe', color: '#1a73e8', fontWeight: '500' },
  navIcon: { width: '24px', marginRight: '16px', fontSize: '20px' },
  storageSection: { marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid #e0e0e0' },
  storageHeader: { display: 'flex', alignItems: 'center', color: '#5f6368', fontSize: '14px', fontWeight: '500', marginBottom: '12px' },
  storageBar: { height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' },
  storageProgress: { height: '100%', background: '#1a73e8' },
  storageText: { fontSize: '12px', color: '#5f6368' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f1f3f4' },
  toolbar: { height: '64px', background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' },
  toolbarLeft: { display: 'flex', gap: '12px' },
  uploadButton: { padding: '10px 24px', background: '#1a73e8', color: '#fff', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', border: 'none', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)' },
  toolbarRight: { display: 'flex', gap: '4px' },
  viewButton: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  viewButtonActive: { background: '#e8f0fe', color: '#1a73e8' },
  contentArea: { flex: 1, overflow: 'auto', padding: '24px' },
  gridView: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  gridItem: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' },
  gridItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  moreButton: { background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: '#5f6368', borderRadius: '50%', fontSize: '14px' },
  fileActions: { display: 'flex', gap: '4px' },
  actionButton: { background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', color: '#5f6368', borderRadius: '4px', fontSize: '14px' },
  gridItemName: { fontSize: '14px', fontWeight: '400', color: '#202124', marginBottom: '4px', wordBreak: 'break-word' },
  gridItemMeta: { fontSize: '12px', color: '#5f6368' },
  listView: { background: '#fff', borderRadius: '8px', overflow: 'hidden' },
  listHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', fontSize: '12px', fontWeight: '500', color: '#5f6368' },
  listRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #f1f3f4', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' },
  listColName: { display: 'flex', alignItems: 'center', fontSize: '14px', color: '#202124' },
  listColOwner: { fontSize: '13px', color: '#5f6368' },
  listColModified: { fontSize: '13px', color: '#5f6368' },
  listColSize: { fontSize: '13px', color: '#5f6368' },
  listActions: { display: 'flex', gap: '4px', justifyContent: 'flex-end' },
  listActionButton: { background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: '#5f6368', borderRadius: '4px', fontSize: '14px' }
};

export default Dashboard;
