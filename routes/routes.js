const express = require('express');
const controller = require('../controllers/controller');
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'static/img/users/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
const upload = multer({ storage: storage });

router.get('/', controller.home);
router.get('/signup', controller.signupGet);
router.post('/signup', controller.signupPost);
router.get('/signin', controller.signinGet);
router.post('/signin', controller.signinPost);
router.get('/profile/:id', controller.profileGet);
router.post('/profile/:id', controller.profilePost);
router.get('/logout', controller.logout);
router.get('/add/:id', controller.addGet);
router.post('/add/:id', controller.addPost);
router.post('/like/:id', controller.like);
router.get('/reply/:id', controller.replyGet);
router.post('/reply/:id', controller.replyPost);
try {
    router.post("/imgupload", upload.any(), (req, res) => {
        res.status(204).end();
    });
} catch(err) {
    console.log(err.message);
}

function uploadFiles(req, res) {
    console.log(req.body);
    console.log(req.file);
    res.status(204).end();
}

module.exports = router;