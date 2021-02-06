const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');
const { sendCancelationEmail } = require('../services/emailService');

const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();

        sendCancelationEmail(req.user.email, req.user.name);
        
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

const avatar = multer({
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpge|png)/)) {
            callback(new Error('JPG, JPGE, PNG files is allowed.'));
        }
        callback(undefined, true);
    }
})


router.post('/users/avatar', auth, avatar.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize(320, 240).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

router.delete('/users/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    const _id = req.params.id;
    
    try {
        const user = await User.findById(_id);

        if (!user || !user.avatar) {
            res.status(404).send();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(400).send();
    }
    
    res.send();
});


router.delete('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        const user = await User.findByIdAndDelete(_id);

        if (!user) {
            res.status(404).send();
        }
        
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        const user = await User.findById(_id);

        if (!user) {
            res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    const fieldsToUpdate = Object.keys(req.body);
    const fillables = ['name', 'email', 'password', 'age'];
    const isValidOperation = fieldsToUpdate.every((field) => fillables.includes(field));

    if (!isValidOperation) {
        res.status(400).send({ 'error': 'Invalid fields sent.'} )
    }

    try {
        const user = await User.findById(_id);

        fieldsToUpdate.forEach((field) => user[field] = req.body[field]);

        await user.save();

        if (!user) {
            res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;