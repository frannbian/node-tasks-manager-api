const express = require('express');
require('./db/mongoose');
const path = require('path');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');
const authRouter = require('./routers/authRouter');

const app = express();
const port = process.env.PORT;

// Setup static directory to serve 
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(authRouter);
app.use(userRouter);
app.use(taskRouter);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/404.html'))
})

app.listen(port, () => {
    console.log(`Server is up in port ${port}`)
});