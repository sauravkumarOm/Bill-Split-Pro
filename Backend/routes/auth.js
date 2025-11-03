const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const {registerSchema, loginSchema} = require('../validation/auth');

router.post('/register', async(req, res, next)=>{
    try{
        const {error, value} = registerSchema.validate(req.body);
        if(error){
            return res.status(400).json({message: error.details[0].message});
        }
        const {name, email, password} = value;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'user already exists'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword
        })
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(201).json({token, user: {id:user._id, name: user.name, email:user.email}})
    }
    catch(err){
        next(err);
    }
});

router.post('/login', async(req, res, next)=>{
    try{
        const {error, value} = loginSchema.validate(req.body);
        if(error){
            return res.status(400).json({message: error.details[0].message});
        }
        const {email, password} = value;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'invalid credentials'});
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if(!ok){
            return res.status(400).json({message: 'invalid credentials'});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(200).json({token, user: {id:user._id, name: user.name, email:user.email}})
    }
    catch(err){
        next(err);
    }
})

module.exports = router;

