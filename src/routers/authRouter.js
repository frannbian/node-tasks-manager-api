const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');
const { sendWelcomeEmail } = require('../services/emailService');

const router = new express.Router();

router.post('/auth/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    } 
});

router.post('/auth/register', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        
        sendWelcomeEmail(user.email, user.name);

        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

router.get('/auth/me', auth, async (req, res) => {
    res.send(req.user);
});

router.post('/auth/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/auth/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;