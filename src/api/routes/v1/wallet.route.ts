export { };

const express = require('express');
const {
    deleteWallet,
    list,
    getOneWallet,
    setBetAverage } = require('../../controllers/wallet.controller')
const { authorize, RESPONSABLE, LOGGED_USER, SOUS_ADMIN, SUPER_ADMIN } = require('../../middlewares/auth');


const router = express.Router();

router.put('/setBetAverage/:userId', authorize(), setBetAverage);


router.route('/list').get(authorize(), list);
router.get('/getOneWallet/:userId', authorize(), getOneWallet);
router.delete('/deleteWallet/:id', authorize(), deleteWallet);



module.exports = router;
