export { };

const express = require('express');
const {
    generateStripe,handlePayment } = require('../../controllers/stripe')
const { authorize, RESPONSABLE, LOGGED_USER, SOUS_ADMIN, SUPER_ADMIN } = require('../../middlewares/auth');


const router = express.Router();

router.post('/generate-payment-intent', authorize(), generateStripe);
router.post('/create-payment-intent', authorize(), handlePayment);

module.exports = router;
