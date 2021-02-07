const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/authMiddleware');

const router = new express.Router();

router.post('/tasks', auth,  async (req, res) => {
    const task = new Task({
        ...req.body,
        user: req.user._id
    });


    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        // const tasks = await Task.find({ user: req.user._id });
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        const task = await Task.findOne({ _id, user: req.user._id });

        if (!task) {
            res.status(404).send();
        }
        
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    const fieldsToUpdate = Object.keys(req.body);
    const fillables = ['description', 'completed'];
    const isValidOperation = fieldsToUpdate.every((field) => fillables.includes(field));

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid fields sent.'} )
    }

    try {
        const task = await Task.findOne({ _id, user: req.user._id });

        if (!task) {
            res.status(404).send();
        }

        fieldsToUpdate.forEach((field) => task[field] = req.body[field]);
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
       
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        const task = await req.user.remove();

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;