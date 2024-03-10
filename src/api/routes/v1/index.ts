export {};
import * as express from 'express';
import { apiJson } from '../../../api/utils/Utils';

const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const uploadRoutes = require('./upload.route');
const dicussionsRoute = require('./discussion.route');
const ChallengeRoute = require('./challenge.route');
const messageRoute = require('./message.route');
const walletRouter = require('./wallet.route');
const StreamRouter = require('./stream.route');
const NotificationRouter = require('./notification.route');
const PaymentRouter = require('./payment.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res, next) => {
  apiJson({ req, res, data: { status: 'OK' } });
  return next();
});

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));
router.use('/discussion', dicussionsRoute);
router.use('/challenge', ChallengeRoute);
router.use('/message', messageRoute);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/wallet', walletRouter);
router.use('/stream', StreamRouter);
router.use('/notification', NotificationRouter);
router.use('/payment', PaymentRouter);

router.use('/upload', uploadRoutes);

module.exports = router;
