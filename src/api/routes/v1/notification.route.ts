export {};
const express = require('express');
const notificationController = require('../../controllers/notification.controlle');
const { authorize, RESPONSABLE, LOGGED_USER, SOUS_ADMIN, SUPER_ADMIN } = require('../../middlewares/auth');

const router = express.Router();
router.route('/deleteNotification').delete(notificationController.deleteNotification);
router.route('/readNotifications').get(notificationController.readNotification);
router.route('/one').get(authorize(),notificationController.readNotification);

module.exports = router;
