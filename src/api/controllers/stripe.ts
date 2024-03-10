import { NextFunction, Request, Response } from 'express';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const userWallet = require("../models/userWallet.model")
const User = require("../models/user.model")

const handlePayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount } = req.body;
        // substract the payout amount from the user's balance
        const user = req.route.meta.user;
        const wallet = await userWallet.findOne({user:user._id})
        if(wallet.balance <amount){
            return res.status(403).json({error:"Insufficient funds"});
        }
        wallet.balance -= amount;
        await wallet.save

        // initiate a payout to the user's connected stripe account
        const payout = await stripe.payouts.create({
            amount: amount * 100,
            currency: 'usd',
            destination: wallet.stripeCustomId,
        });
        res.json({ message: 'Payout Initiated', payout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payout failed' });
    }
};
const handlePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount } = req.body;

        // create PaymentIntent using stripe  for enhanced security and flexibility in payment processing
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'eur',
            receipt_email:req.body.email,
            automatic_payment_methods: {
                enabled: true,
            }
        });
        const user = req.route.meta.user;

        const wallet = await User.findById(user._id)
        // update user balance after successful payment
        wallet.balance += amount;
        await wallet.save();

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Payment failed' });
    }
};

const generateStripe = async(req:any,res:any) =>{
    try{

        const user = await User.findOne({email:req.route.meta.user.email})
        console.log(user);
        console.log(req.route.meta.user);
        
        const accountLink = await stripe.accountLinks.create({
            account:user.bank_acc,
            refresh_url: 'https://seragii.com/player/'+user._id,
            return_url: 'https://seragii.com/player/'+user._id,
            type: 'account_onboarding',
        });

        user.link_pay = accountLink.url
        await user.save();

        return res.status(200).json(user)
    
    }catch(err){
        console.log(err);
        res.status(401).json(err)
    }
}
module.exports = {
    handlePayout,
    handlePayment,
    generateStripe
};