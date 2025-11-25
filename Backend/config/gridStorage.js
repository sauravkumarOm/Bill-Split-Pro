const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url : process.env.MONGO_URI,
    file: (req, file) =>{
        return {
            bucketName: 'uploads',
            filename: `avatar_${req.user.id}_${Date.now()}_${file.originalname}`
        }
    }
})

const upload =  multer({storage});

module.exports = upload;