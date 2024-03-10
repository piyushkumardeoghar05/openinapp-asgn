const taskModel = require("../Models/taskModel");
const subtaskModel = require("../Models/subTaskModel");
const userModel = require("../Models/userModel");
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const jwt_key = "sctkygjkh";


cron.schedule('*/1 * * * *', async () => {
    try {
        // Query tasks from the database
        const tasks = await taskModel.find();

        // Iterate over tasks
        for (const task of tasks) {
            const dueDate = new Date(task.due_date);
            const currentDate = new Date();

            // Calculate the difference in days between the due date and current date
            const diffDays = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));

            // Update task priority based on due date
            if (diffDays === 0) {
                task.priority = 0;
            } else if (diffDays <= 2) {
                task.priority = 1;
            } else if (diffDays <= 4) {
                task.priority = 2;
            } else {
                task.priority = 3;
            }

            // Save the updated task
            await task.save();
        }

        console.log('Task priorities updated successfully based on due dates.');
    } catch (error) {
        console.error('Error updating task priorities:', error);
    }
});


const accountSid = "my__twilio_sid";
const authToken = "my_twilio_token";
const client = require("twilio")(accountSid, authToken);


cron.schedule('*/1 * * * *', async () => {
    try {
        // Fetch users sorted by priority
        const users = await userModel.find().sort({ priority: 1 });

        for (const user of users) {
            // Find overdue tasks for the user
            const overdueTasks = await taskModel.find({
                user_id: user._id,
                due_date: { $lt: new Date() } // Find tasks with due dates in the past
            });

            if (overdueTasks.length > 0) {
                // Add "+91" in front of the phone number, convert to string, and then use it as "to" parameter
                const toNumber = "+91" + user.phone_number.toString();

                // Make voice call using Twilio
                const call = await client.calls.create({
                    url: "http://demo.twilio.com/docs/voice.xml",
                    to: toNumber, // Use the modified phone number
                    from: "+12053514720",
                  });

                console.log('Voice call initiated for user:', user._id);

                // Check call status after 30 seconds
                setTimeout(async () => {
                    // Check call status using Twilio's REST API
                    const callDetails = await client.calls(call.sid).fetch();
                    
                    // If the call is not in progress or completed, continue to the next user
                    if (callDetails.status !== 'in-progress' && callDetails.status !== 'completed') {
                        console.log('Call status after 30 seconds:', callDetails.status);
                        return; // Exit the loop
                    }

                    console.log('User attended the call:', user._id);
                }, 50000); // 30 seconds

                // Break the loop if the user attended the call
                break;
            }
        }
    } catch (error) {
        console.error('Error in voice calling using Twilio:', error);
    }
});


module.exports = () => {
    // No need to do anything here as cron jobs are already scheduled
};