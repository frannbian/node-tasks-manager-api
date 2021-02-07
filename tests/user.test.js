require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/auth/register')
        .send({
            name: 'Test Jest',
            email: 'test@example.com',
            password: 'jesttesting'
        })
        .expect(201);
        
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Test Jest',
            email: 'test@example.com',
        },
        token: user.tokens[0].token
    });

    // Password must be hashed
    expect(user.password).not.toBe('jesttesting')

})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/auth/login')
        .send({
            'email': userOne.email,
            'password': userOne.password
        })
        .expect(200);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existing user', async () => {
    await request(app)
        .post('/auth/login')
        .send({
            'email': 'nonexistinguser@jest.com',
            'password': 'itdoesntexist'
        })
        .expect(400);
})

test('Should get user profile', async () => {
    await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not get user profile if is not authenticated', async () => {
    await request(app)
        .get('/auth/me')
        .send()
        .expect(401);
})

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    // Assert that the database was changed correctly
    const user = await User.findById(userOneId);
    expect(user).toBeNull()
})

test('Should not delete account for user if is not authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
})

test('Should upload an avatar image', async () => {
    const response = await request(app)
                        .post('/users/avatar')
                        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
                        .expect(200);
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch(`/users/${userOneId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Testing Update User'
        })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toBe('Testing Update User');
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch(`/users/${userOneId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Invalid field st 2400'
        })
        .expect(400);
})