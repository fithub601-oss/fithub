const router = require('express').Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/calendarController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.post('/', protect, admin, createEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;