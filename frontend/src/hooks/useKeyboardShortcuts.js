import { useEffect } from 'react';

const useKeyboardShortcuts = ({ 
  onUpload, 
  onNewFolder, 
  onSelectAll, 
  onDelete, 
  onSearch,
  onToggleView,
  selectedFiles 
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const { ctrlKey, metaKey, shiftKey, key } = e;
      const isModifier = ctrlKey || metaKey;

      switch (key) {
        case 'u':
          if (isModifier) {
            e.preventDefault();
            onUpload?.();
          }
          break;
        case 'n':
          if (isModifier && shiftKey) {
            e.preventDefault();
            onNewFolder?.();
          }
          break;
        case 'a':
          if (isModifier) {
            e.preventDefault();
            onSelectAll?.();
          }
          break;
        case 'Delete':
          if (selectedFiles?.length > 0) {
            e.preventDefault();
            onDelete?.();
          }
          break;
        case 'f':
          if (isModifier) {
            e.preventDefault();
            onSearch?.();
          }
          break;
        case 'v':
          if (isModifier && shiftKey) {
            e.preventDefault();
            onToggleView?.();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUpload, onNewFolder, onSelectAll, onDelete, onSearch, onToggleView, selectedFiles]);
};

export default useKeyboardShortcuts;