const express = require('express');
const Razorpay = require('razorpay');
const crpyto = require('crypto');
const Settlement = require('../models/Settlement');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/create-order', auth, async (req,res, next)=>{
    try{
        const {amount, settlementId} = req.body;

        const rezorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: settlementId,
        };

        const order = await rezorpay.orders.create(options);
        res.status(201).json({order});

    }
    catch(err){
        next(err);
    }
})

router.post('/verify', auth, async (req,res,next)=>{
    try{
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature, settlementId} =  req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crpyto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if(expectedSignature === razorpay_signature){
            await Settlement.findByIdAndUpdate(settlementId, {status: "Completed"});
            res.json({message: "Payment verified successfully"});
        }

        res.status(400).json({message: "Invalid signature"});

        
    }
    catch(err){
        next(err);
    }
})

module.exports = router;