const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const { createGroup, addMember } = require('../validation/group');
const { createExpense } = require('../validation/expense');
const { computeSettlements } = require('../utils/settlements');

// create a group
router.post('/', auth, async (req, res, next) => {
    try {
        const { error, value } = createGroup.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const group = await Group.create({
            name: value.name,
            currency: value.currency || 'INR',
            createdBy: req.user.id,
            members: [req.user.id]
        });
        res.status(201).json({ group });
    }
    catch (err) {
        next(err);
    }
});

// list groups of the user
router.get('/', auth, async (req, res, next) => {
    try {
        const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
        res.json({ groups });
    }
    catch (err) {
        next(err);
    }
});

// get group by id
router.get('/:id', auth, async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id).populate('members', 'name email');
        if (!group) {
            return res.status(404).json({ message: 'group not found' });
        }

        const expenses = await Expense.find({ group: group._id }).populate('paidBy', 'name email')
            .populate('splits.user', 'name email').sort({ date: -1 })

        res.json({ group: { ...group.toObject(), expenses } });
    }
    catch (err) {
        next(err);
    }
});

// add the member by email
router.post('/:id/members', auth, async (req, res, next) => {
    try {
        const { error, value } = addMember.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'group not found' });
        }

        if (String(group.createdBy) !== req.user.id && !group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'forbidden' });
        }

        const user = await User.findOne({ email: value.email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if (group.members.some(m => String(m) === String(user._id))) {
            return res.status(400).json({ message: 'user already a member' });
        }

        group.members.push(user._id);
        await group.save();
        // res.json({group});
        const updatedGroup = await Group.findById(group._id).populate('members', 'name email');
        const io = req.app.get('io');
        io.to(group._id.toString()).emit('memberAdded', { name: user.name, email: user.email });
        io.to(group._id.toString()).emit('groupUpdated', { message: `${user.name} joined the group` });

        res.json({ group: updatedGroup });
    }
    catch (err) {
        next(err);
    }
});

// Add expense to group
router.post('/:id/expenses', auth, async (req, res, next) => {
    try {
        const { error, value } = createExpense.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, amount, paidBy, splitType = 'equal', splits = [], note, receiptUrl } = value;

        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'group not found' });
        }
        if (!group.members.some(m => String(m) === req.user.id)) {
            return res.status(403).json({ message: 'forbidden' });
        }

        let finalSplits = [];

        if (splitType === 'equal') {
            const perHead = parseFloat((amount / group.members.length).toFixed(2));
            finalSplits = group.members.map(m => ({
                user: m,
                share: perHead
            }));
        }
        else if (splitType === 'percentage') {
            const totalPercent = splits.reduce((acc, s) => acc + Number(s.share), 0);
            if (Math.abs(totalPercent - 100) > 0.02) {
                return res.status(400).json({ error: 'Total percentage must be 100%' });
            }
            finalSplits = splits.map(s => ({
                user: s.user,
                share: parseFloat(((s.share / 100) * amount).toFixed(2))
            }));
        }
        else if (splitType === 'custom') {
            const sum = splits.reduce((acc, s) => acc + Number(s.share), 0);
            if (Math.abs(sum - amount) > 0.02) {
                return res.status(400).json({ error: 'Splits do not sum to total amount' });
            }
            finalSplits = splits;
        }

        for (const s of finalSplits) {
            if (!group.members.some(m => String(m) === String(s.user))) {
                return res.status(400).json({ message: 'All split users must be group members' });
            }
        }

        let expense = await Expense.create({
            title,
            amount,
            paidBy,
            group: group._id,
            splitType,
            splits: finalSplits,
            note,
            receiptUrl
        });

        expense = await expense.populate('paidBy', 'name email');
        expense = await expense.populate('splits.user', 'name email');

        // Emit socket event to group members about new expense
        const io = req.app.get('io');
        io.to(group._id.toString()).emit('newExpense', { expense });

        res.status(201).json({ expense });

    }
    catch (err) {
        next(err);
    }
});

// list expenses of a group
router.get('/:id/expenses', auth, async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'group not found' });
        }
        if (!group.members.some(m => String(m) === req.user.id)) {
            return res.status(403).json({ message: 'forbidden' });
        }

        const expenses = await Expense.find({ group: group._id }).populate('paidBy', 'name email').populate('splits.user', 'name email').sort({ date: -1 });
        res.json({ expenses });
    }
    catch (err) {
        next(err);
    }
})

// settlements of a group
router.get('/:id/settlements', auth, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'group not found' });

    if (!group.members.some(m => String(m) === req.user.id))
      return res.status(403).json({ message: 'forbidden' });

    const expenses = await Expense.find({ group: group._id });

    const netMap = {};
    const ensure = (uid) => (netMap[uid] = netMap[uid] || 0);
    group.members.forEach((m) => ensure(String(m)));

    for (const exp of expenses) {
      const payer = String(exp.paidBy);
      ensure(payer);
      netMap[payer] += exp.amount;

      for (const s of exp.splits) {
        ensure(String(s.user));
        netMap[String(s.user)] -= s.share;
      }
    }

    const settlementsData = computeSettlements(netMap);

    const populated = await Promise.all(
      settlementsData.map(async (s) => {
        const fromUser = await User.findById(s.from).select('name email');
        const toUser = await User.findById(s.to).select('name email');

        // check if already exists for this group/from/to
        let settlement = await Settlement.findOne({
          groupId: group._id,
          from: s.from,
          to: s.to,
        });

        if (!settlement) {
          settlement = await Settlement.create({
            groupId: group._id,
            from: s.from,
            to: s.to,
            amount: s.amount,
            status: 'Pending',
          });
        } else {
          // update amount if changed
          settlement.amount = s.amount;
          await settlement.save();
        }

        return {
          _id: settlement._id,
          from: fromUser ? fromUser.name : s.from,
          fromEmail: fromUser?.email || null,
          to: toUser ? toUser.name : s.to,
          toEmail: toUser?.email || null,
          amount: Math.round(s.amount),
          status: settlement.status,
        };
      })
    );

    const io = req.app.get('io');
    io.to(group._id.toString()).emit('settlements_updated', { settlements: populated });

    res.json({ settlements: populated });
  } catch (err) {
    next(err);
  }
});


// Settlement Paid

router.patch('/:id/markPaid', auth, async (req, res, next) => {
    try {
        const settlement = await Settlement.findById(req.params.id);
        if (!settlement) {
            return res.status(404).json({ message: 'settlement not found' });
        }

        settlement.status = 'Completed';
        await settlement.save();

        const io = req.app.get('io');
        io.to(settlement.groupId.toString()).emit('settlements_updated', settlement);

        res.json({ message: 'Settlement marked as completed', settlement });
    }
    catch (err) {
        next(err);
    }
})

module.exports = router;