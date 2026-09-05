const router = require('express').Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/calendarController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/security');

router.get('/', getEvents);
router.post('/', protect, admin, createEvent);
router.delete('/:id', protect, admin, validateObjectId, deleteEvent);

module.exports = router;