const taskModel = require("../Models/taskModel");
const subtaskModel = require("../Models/subTaskModel");
const userModel = require("../Models/userModel");
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const jwt_key = "sctkygjkh";

// Function to calculate the status of the task based on subtask completion
async function calculateTaskStatus(task) {
  const subtasks = await subtaskModel.find({ _id: { $in: task.subtasks } });
  const isAnySubtaskInProgress = subtasks.some(
    (subtask) => subtask.status === 1
  );
  const isAllSubtasksDone = subtasks.every((subtask) => subtask.status === 1);

  if (isAllSubtasksDone) {
    return "DONE";
  } else if (isAnySubtaskInProgress) {
    return "IN_PROGRESS";
  } else {
    return "TODO";
  }
}

// function calculatePriority(due_date) {
//   if (due_date === 0) {
//     return 0;
//   } else if (due_date <= 2) {
//     return 1;
//   } else if (due_date <= 4) {
//     return 2;
//   } else {
//     return 3;
//   }
// }
exports.createTask = async (req, res) => {
  try {
    // Extract necessary details from the request body
    const { title, description, due_date } = req.body;

    // Get the user ID from the decoded JWT payload
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwt_key);
    const userId = decoded.payload;

    // Check if the user exists
    const user = await userModel.findById(userId);
    // Create the task
    // let priority = calculatePriority(due_date);

    // Create the task with the determined priority
    const task = new taskModel({
      title,
      description,
      due_date,
      user_id: userId,
    });

    // Save the task to the database
    await task.save();

    // Add the task ID to the user's tasks array
    user.tasks.push(task._id);
    await user.save();

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createSubtask = async (req, res) => {
  try {
    // Extract necessary details from the request body
    const { task_id, status } = req.body;

    // Check if the task exists
    const task = await taskModel.findById(task_id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Create the subtask
    const subTask = new subtaskModel({
      task_id,
      status,
    });

    // Save the subtask to the database
    await subTask.save();

    // Add the subtask ID to the task's subtasks array
    task.subtasks.push(subTask._id);
    await task.save();
    task.status = await calculateTaskStatus(task);
    await task.save();
    res.status(201).json(subTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSubTask = async (req, res) => {
  try {
    const {id}=req.params;
    const { status } = req.body;
    console.log(id,status);
    // Check if the subtask exists
    const subtask = await subtaskModel.findById(id);
    if (!subtask || subtask.deleted_at!=null) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    const task = await taskModel.findById(subtask.task_id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    // Update the status of the subtask
    subtask.status = status;
    await subtask.save();

    // Find the corresponding task for the subtask
    

    // Update the status of the corresponding task based on the subtask statuses
    task.status = await calculateTaskStatus(task);
    await task.save();

    res.status(200).json({ message: "Subtask updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const {id}=req.params;
    const {  due_date } = req.body;

    // Check if the task exists
    const task = await taskModel.findById(id);
    if (!task || task.deleted_at!=null) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update the due_date of the task
    task.due_date = due_date;

    // Update the priority of the task based on the new due_date
    // task.priority = calculatePriority(due_date);

    // Save the updated task to the database
    await task.save();

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSubTask = async (req, res) => {
    try {
      const { id } = req.params; // Use req.params.id to get the subtask ID
  
      // Check if the subtask exists
      const subtask = await subtaskModel.findById(id);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
  
      // Soft delete the subtask by setting the deleted_at field
      subtask.deleted_at = new Date();
      await subtask.save();
  
      // Remove the subtask ID from the corresponding task
      const task = await taskModel.findById(subtask.task_id);
      if (task) {
        task.subtasks = task.subtasks.filter((taskId) => taskId.toString() !== id);
        await task.save();
        
        // Calculate and update the task status
        task.status = await calculateTaskStatus(task);
        await task.save();
      }
  
      res.status(200).json({ message: "Subtask deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  exports.deleteTask = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the task exists
      const task = await taskModel.findById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
  
      // Soft delete the task by setting the deleted_at field
      task.deleted_at = new Date();
      await task.save();
  
      // Soft delete all subtasks associated with the task
      await subtaskModel.updateMany(
        { task_id: id },
        { $set: { deleted_at: new Date() } }
      );
  
      // Remove the task ID from the user's tasks array
      const user = await userModel.findOneAndUpdate(
        { _id: task.user_id },
        { $pull: { tasks: id } }
      );
  
      res.status(200).json({ message: "Task and its subtasks deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

exports.getAllUserTasks = async (req, res) => {
  try {
    const { priority, due_date, page = 1, limit = 10 } = req.query;

    let filters = {};
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwt_key);
    const userId = decoded.payload;
    filters.user_id = userId; // Assuming user ID is stored in req.user._id after authentication

    if (priority) {
      filters.priority = priority;
    }
    if (due_date) {
      filters.due_date = due_date;
    }
    filters.deleted_at=null;

    const tasks = await taskModel
      .find(filters)
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllUserSubTasks = async (req, res) => {
    try {
      const { task_id } = req.query;
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, jwt_key);
      const user_id = decoded.payload;
  
      // Get all tasks for the user
      const userTasks = await taskModel.find({ user_id });
  
      // Extract subtask IDs from user's tasks
      let subTaskIds = [];
      userTasks.forEach((task) => {
        if (!task_id || task._id.equals(task_id)) {
          subTaskIds.push(...task.subtasks);
        }
      });
  
      // Fetch all subtasks with the collected IDs and where deleted_at is null
      const subTasks = await subtaskModel.find({ _id: { $in: subTaskIds }, deleted_at: null });
  
      res.status(200).json(subTasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  






