export { };

const express = require('express');
const {
    getMessages,
  sendMessage, } = require('../../controllers/message.controller')
const { authorize, RESPONSABLE, LOGGED_USER, SOUS_ADMIN, SUPER_ADMIN } = require('../../middlewares/auth');


const router = express.Router();

router.post('/sendMessage/:DiscussionId', authorize(), sendMessage);

router.get('/getMessages/:DiscussionId', authorize(), getMessages);




module.exports = router;
