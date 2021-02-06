const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');
const authRouter = require('./routers/authRouter');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(authRouter);
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is up in port ${port}`)
});