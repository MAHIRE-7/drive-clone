const Folder = require('../models/Folder');

exports.createFolder = async (req, res) => {
  try {
    const folder = new Folder({
      name: req.body.name,
      owner: req.user._id,
      parent: req.body.parentId || null
    });
    
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const parentId = req.query.parentId || null;
    const folders = await Folder.find({ 
      owner: req.user._id,
      parent: parentId
    }).sort({ createdAt: -1 });
    
    res.json(folders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    
    await folder.deleteOne();
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
