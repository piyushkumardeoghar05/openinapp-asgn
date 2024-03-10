// server.js
const express = require('express');
const mongoose = require('mongoose');
const cronJobs = require('./Controllers/cron_job');
const app = express();

// Middleware
app.use(express.json());
// const uri="mongodb+srv://bhanu0312pratap:JaqY887De3Z5Wso9@cluster0.yejrcne.mongodb.net/";
const uri="mongodb+srv://bhanu0312pratap:Ch714LwFpQyu1ugA@cluster0.yejrcne.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// Routes
const userRouter = require("./Routes/userRouter");
const taskRouter=require("./Routes/taskRouter");
// app.use('/auth', authRoutes);
// app.use('/tasks', taskRoutes);

// Connect to MongoDB
const port = process.env.PORT || 5000;

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

app.use("/user", userRouter);
app.use("/task",taskRouter);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
