export { };

const express = require('express');
const {
    createDiscussion,
    joinDiscussion,
    deleteDiscussion,
    list,
    getOneDiscussion } = require('../../controllers/discussion.controller')
const { authorize, RESPONSABLE, LOGGED_USER, SOUS_ADMIN, SUPER_ADMIN } = require('../../middlewares/auth');


const router = express.Router();

router.post('/createDiscussion', authorize(), createDiscussion);
router.post('/joinDiscussion/:id', authorize(LOGGED_USER), joinDiscussion);
router.post('/createCode/:id', authorize(LOGGED_USER), joinDiscussion);


router.route('/list').get(authorize(), list);
router.get('/getOneDiscussion/:id', authorize(), getOneDiscussion);
router.delete('/deleteDiscussion/:id', authorize(LOGGED_USER), deleteDiscussion);



module.exports = router;
