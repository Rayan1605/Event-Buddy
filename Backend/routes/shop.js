const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ============ USER SCHEMA ============
const userSchema = new Schema({
  userEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartId: { type: Number, required: true },
  createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});
const User = mongoose.model('User', userSchema);

// ============ AUTH MIDDLEWARE ============
const checkAuth = (req, res, next) => {
  if (!req.session || !req.session.isLoggedIn) {
    return res.send({ success: false, message: 'Please log in first' });
  }
  next();
};

// ============ EVENT SCHEMA ============
const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  location: { type: String, required: false },
  date: { type: Date, required: false },
  image: { type: String, required: false },
  ourId: { type: String, required: true },
});
const Event = mongoose.model('Event', EventSchema);

let nextEventId = 0;

// ============ AUTH ROUTES ============

// Sign Up
router.get('/signup', async (req, res) => {
  const userEmail = req.query.email.trim();
  let password = req.query.pass.trim();

  try {
    const existing = await User.findOne({ userEmail });
    if (existing) {
      return res.send({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password + process.env.EXTRA_BCRYPT_STRING, 12);
    const newUser = new User({
      userEmail,
      password: hashedPassword,
      cartId: 1,
      createdEvents: [],
      joinedEvents: []
    });

    await newUser.save();
    res.send({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.send({ success: false, message: 'Signup failed' });
  }
});

// Sign In
router.get('/signin', async (req, res) => {
  const userEmail = req.query.email.trim();
  const password = req.query.pass.trim();

  try {
    const user = await User.findOne({ userEmail });
    if (!user) return res.send({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password + process.env.EXTRA_BCRYPT_STRING, user.password);
    if (!isMatch) return res.send({ success: false, message: 'Invalid email or password' });

    req.session.isLoggedIn = true;
    req.session.theUser = {
      userEmail: user.userEmail,
      cartId: user.cartId
    };

    res.send({ success: true, login: true });
  } catch (err) {
    console.error('Signin error:', err);
    res.send({ success: false, message: 'Signin failed' });
  }
});

// Sign Out
router.get('/signout', (req, res) => {
  const loggedIn = req.session.isLoggedIn;
  req.session.isLoggedIn = false;
  req.session.theUser = null;
  res.send({ success: true, wasLoggedIn: loggedIn });
});

router.post('/leaveEvent', checkAuth, async (req, res) => {
  const { ourId } = req.body;

  if (!ourId) {
    return res.status(400).json({ success: false, message: 'Missing event ID' });
  }

  try {
    const user = await User.findOne({ userEmail: req.session.theUser.userEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const event = await Event.findOne({ ourId });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const wasJoined = user.joinedEvents.includes(event._id);

    if (!wasJoined) {
      return res.status(400).json({ success: false, message: 'User was not joined to this event' });
    }

    // Remove the event from joinedEvents
    user.joinedEvents = user.joinedEvents.filter(id => id.toString() !== event._id.toString());
    await user.save();

    // Double-check removal
    const updatedUser = await User.findById(user._id);
    const stillJoined = updatedUser.joinedEvents.includes(event._id);

    if (stillJoined) {
      return res.status(500).json({ success: false, message: 'Failed to leave event' });
    }

    res.json({ success: true, message: 'Successfully left the event' });
  } catch (err) {
    console.error('Error leaving event:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/joinEvent', checkAuth, async (req, res) => {
  const { ourId } = req.body;

  if (!ourId) {
    return res.status(400).json({ success: false, message: 'Missing event ID' });
  }

  try {
    const user = await User.findOne({ userEmail: req.session.theUser.userEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const event = await Event.findOne({ ourId });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check if the user already joined this event
    const alreadyJoined = user.joinedEvents.some(id => id.toString() === event._id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'User already joined this event' });
    }

    // Check if the user is the creator of the event
    const isCreator = user.createdEvents.some(id => id.toString() === event._id.toString());
    if (isCreator) {
      return res.status(400).json({ success: false, message: 'Cannot join an event you created' });
    }

    // Add the event to joinedEvents
    user.joinedEvents.push(event._id);
    await user.save();

    // Double-check addition
    const updatedUser = await User.findById(user._id);
    const wasAdded = updatedUser.joinedEvents.some(id => id.toString() === event._id.toString());

    if (!wasAdded) {
      return res.status(500).json({ success: false, message: 'Failed to join event' });
    }

    res.json({ success: true, message: 'Successfully joined the event' });
  } catch (err) {
    console.error('Error joining event:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ EVENT ROUTES ============

router.post('/addEvent', checkAuth, async (req, res) => {
  try {
    const user = await User.findOne({ userEmail: req.session.theUser.userEmail });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const {
      title,
      description,
      location,
      date,
      endDate,
      imageUrl,
      category,
      maxAttendees
    } = req.body;

    const newEvent = new Event({
      ourId: '9' + nextEventId,
      title,
      description,
      location,
      date: new Date(date),
      image: imageUrl || 'sample.jpg',
      endDate: new Date(endDate),
      category,
      maxAttendees
    });

    const savedEvent = await newEvent.save();
    nextEventId++;

    user.createdEvents.push(savedEvent._id);
    await user.save();

    console.log('Saved event and linked it to user');
    res.json({ success: true, id: newEvent.ourId });
  } catch (err) {
    console.error('Error adding event and linking to user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all events (public)
router.get('/', (req, res) => {
  Event.find()
    .then(events => res.send(JSON.stringify(events)))
    .catch(err => res.send(JSON.stringify(err)));
});

// Get all events via POST (public)
router.post('/', (req, res) => {
  Event.find()
    .then(events => res.json({ success: true, events }))
    .catch(err => res.json({ success: false, error: err }));
});

// Get specific event (protected)
router.post('/getSpecificEvent', checkAuth, (req, res) => {
  Event.find({ ourId: req.body.ourId })
    .then(events => res.json({ success: true, event: events[0] }))
    .catch(err => res.json({ success: false, error: err }));
});

// Get specific event via GET (protected)
router.get('/getSpecificEvent', checkAuth, (req, res) => {
  Event.find({ ourId: req.query.ourId })
    .then(events => res.json({ success: true, event: events[0] }))
    .catch(err => res.json({ success: false, error: err }));
});

router.get('/sortedEvents', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // 1 = ascending (soonest first)
    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching sorted events:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Update event (protected)
router.get('/updateSpecificEvent', checkAuth, async (req, res) => {
  try {
    const eventId = req.query.ourId || '1';

    const event = await Event.findOne({ ourId: eventId });
    if (!event) return res.status(404).send('Event not found');

    const user = await User.findOne({ userEmail: req.session.theUser.userEmail });
    if (!user) return res.status(401).send('User not logged in');

    const userOwnsEvent = user.createdEvents.some(id => id.toString() === event._id.toString());
    if (!userOwnsEvent) return res.status(403).send('Not authorized to update this event');

    event.title = 'Updated Title';
    await event.save();

    console.log('Event updated successfully');
    res.send({ success: true, message: 'Event updated' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).send('Server error');
  }
});

// Delete event (protected)
router.get('/deleteSpecificEvent', checkAuth, (req, res) => {
  Event.findOneAndRemove({ ourId: '0' })
    .then(resp => res.redirect('/'))
    .catch(err => res.send('No event found'));
});

router.get('/myCreatedEvents', checkAuth, async (req, res) => {
  try {
    const user = await User.findOne({ userEmail: req.session.theUser.userEmail })
      .populate('createdEvents');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      createdEvents: user.createdEvents
    });
  } catch (err) {
    console.error('Error fetching created events:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/suggestEventName', checkAuth, async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt || typeof userPrompt !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid prompt' });
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.9,
    });

    const suggestion = response.data.choices[0].message.content.trim();
    res.json({ success: true, name: suggestion });
  } catch (err) {
    console.error('OpenAI error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to generate name' });
  }
});


router.get('/myJoinedEvents', checkAuth, async (req, res) => {
  try {
    const user = await User.findOne({ userEmail: req.session.theUser.userEmail })
      .populate('joinedEvents');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      joinedEvents: user.joinedEvents
    });
  } catch (err) {
    console.error('Error fetching joined events:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
