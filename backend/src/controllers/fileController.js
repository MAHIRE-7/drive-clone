const File = require('../models/File');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.uploadFile = async (req, res) => {
  try {
    const file = new File({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      owner: req.user._id,
      folder: req.body.folderId || null
    });
    
    await file.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: req.file.size } });
    
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const folderId = req.query.folderId || null;
    const files = await File.find({ 
      owner: req.user._id,
      folder: folderId
    }).sort({ createdAt: -1 });
    
    res.json(files);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { sharedWith: req.user._id }]
    });
    
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    fs.unlinkSync(file.path);
    await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -file.size } });
    await file.deleteOne();
    
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.shareFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    const userToShare = await User.findOne({ email: req.body.email });
    if (!userToShare) return res.status(404).json({ error: 'User not found' });
    
    if (!file.sharedWith.includes(userToShare._id)) {
      file.sharedWith.push(userToShare._id);
      await file.save();
    }
    
    res.json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSharedFiles = async (req, res) => {
  try {
    const files = await File.find({ sharedWith: req.user._id }).populate('owner', 'name email');
    res.json(files);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
