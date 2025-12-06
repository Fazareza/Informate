const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
router.get('/categories', eventController.getCategories);
router.get('/:id', eventController.getEventById);
router.get('/', eventController.getAllEvents);


router.post('/', 
    authMiddleware, 
    upload.single('banner_image'),
    eventController.createEvent
);
router.put('/:id', authMiddleware, upload.single('banner_image'), eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);
module.exports = router;