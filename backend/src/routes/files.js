const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('file'), fileController.uploadFile);
router.get('/', auth, fileController.getFiles);
router.get('/shared', auth, fileController.getSharedFiles);
router.get('/:id/download', auth, fileController.downloadFile);
router.delete('/:id', auth, fileController.deleteFile);
router.post('/:id/share', auth, fileController.shareFile);

module.exports = router;
