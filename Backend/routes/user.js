const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Settlement = require('../models/Settlement');
const auth = require('../middlewares/auth');

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