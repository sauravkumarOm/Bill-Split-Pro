const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next)=>{
    const header = req.header('authorization') || req.header('x-auth-token');
    if(!header){
        return res.status(401).json({message: 'Access Denied. No token provided.'});
    }
    const token = header.startsWith('Bearer') ? header.slice(7).trim() : header;
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: payload.id};
        next();
    }
    catch(err){
        return res.status(400).json({message: 'Invalid token.'});
    }
}

module.exports = authenticateToken;