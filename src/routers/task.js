const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_desc
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
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: req.query.limit ? parseInt(req.query.limit) : 0,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort,
        // fetch 1st page of 2 & then 3rd page of 2
        // fetch 1st page of 3 & then 2nd page of 3
      },
    });

    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body); // Using the object keys it converts the request.body an object to an array of properties
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((update) => {
    allowedUpdates.includes(update);
  });
  // if (!isValidOperation) {
  //   return res.status(400).send({ error: 'Invalid updates' });
  // }
  try {
    // const tasks = await Task.findById(req.params.id);
    const tasks = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!tasks) {
      return res.status(404).send();
    }
    updates.forEach((update) => (tasks[update] = req.body[update]));
    await tasks.save();
    res.send(tasks);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send('cannot find task');
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
