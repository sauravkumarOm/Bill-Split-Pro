const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Settlement = require('../models/Settlement');
const auth = require('../middlewares/auth');
const upload = require('../config/gridStorage');

const conn = mongoose.connection;
let gfs;

conn.once('open', ()=>{
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
})

router.post('/me/avatar', auth , upload.single("avatar"), async(req,res,next)=>{
  try{
    if(!req.file){
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(req.user.id,
    {
      avatarFileId: req.file.id
    },
    { new: true })
    console.log("Avatar URL sent to frontend:", `/api/users/avatar/${req.file.id}`);

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: `/api/users/avatar/${req.file.id}`,
    });
  }
  catch(err){
    next(err);
  }
})

router.get("/avatar/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      res.status(404).json({ error: "Image not found" });
    });

    downloadStream.pipe(res);
  } catch (err) {
    res.status(400).json({ error: "Invalid file ID" });
  }
});


router.get('/me', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const settlements = await Settlement.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .populate('from', 'name')
      .populate('to', 'name')
      .populate('groupId', 'name');

    res.json({
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarFileId ? `/api/users/avatar/${user.avatarFileId}` : null,
      },
      settlements: settlements.map((s) => ({
        _id: s._id,
        groupName: s.groupId?.name || 'Unknown Group',
        from: s.from?.name,
        to: s.to?.name,
        amount: Math.round(s.amount),
        status: s.status, 
      })),
    });
  } catch (err) {
    next(err);
  }
});



module.exports = router;