export {};
const express = require('express');
const streamController = require('../../controllers/stream.controller');
const { authorize, RESPONSABLE, LOGGED_USER, SOUS_ADMIN, SUPER_ADMIN } = require('../../middlewares/auth');

const router = express.Router();
router.post('/createStream',authorize(),streamController.createStream);
router.route('/deleteStream/:id').delete(authorize(),streamController.deleteStream);
router.route('/updateStream/:id').put(authorize(),streamController.updateStream);
router.get('/getAllStreams/',authorize(),streamController.getAllStreams);
router.get('/getOneStreams/:id',authorize(),streamController.getOneStreams);
router.route('/createChatMessage/').post(authorize(),streamController.createChatMessage);
router.route('/getChatMessagesByStream/:streamId').get(authorize(),streamController.getChatMessagesByStream);

module.exports = router;
