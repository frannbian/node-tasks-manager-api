const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');

const userOneId = mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'Test User',
    email: 'test@jest.com',
    password: 'test_!',
    tokens: [{
        token: jwt.sign({ '_id': userOneId }, process.env.JWT_KEY)
    }]
}

const setupDatabase = async () => {
    await User.deleteMany();
    await new User(userOne).save();
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase
}