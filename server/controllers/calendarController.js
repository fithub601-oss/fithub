const CalendarEvent = require('../models/CalendarEvent');

// @desc    Get events within a date range (or all)
// @route   GET /api/events?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = {};
    if (start && end) {
      filter.date = {
        $gte: new Date(`${start}T00:00:00.000Z`),
        $lte: new Date(`${end}T23:59:59.999Z`)
      };
    }
    const events = await CalendarEvent.find(filter).sort('date');
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a calendar event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, date, type, color } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Event title is required' });
    }
    const parsedDate = date ? new Date(date) : null;
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'A valid event date is required' });
    }
    if (type && !['event', 'class', 'holiday', 'other'].includes(type)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const sanitize = (value) =>
      String(value)
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const event = await CalendarEvent.create({
      title: sanitize(title).slice(0, 80),
      description: description ? sanitize(description).slice(0, 300) : '',
      date: parsedDate,
      type: type || 'event',
      color: color || '#f97316',
      createdBy: req.user._id
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a calendar event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEvents, createEvent, deleteEvent };