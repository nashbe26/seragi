const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/user.model'); // Your User model
const FacebookStrategy = require('passport-facebook')
const dotenv = require('dotenv')
const moment = require('moment');
const uuidv4 = require('uuid/v4');

const jwt = require('jsonwebtoken');
dotenv.config()

GOOGLE_CLIENT_ID = "346052481883-tlgna5t0bm9pquhvs0rvd3bi0u2qr5ui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"

const appId = '896491195403918';
const appSecret = '24f3aab15fd4ac7d99a8c87e62600ea0';
// Configure strategy options
const options = {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://seragii.com/api/v1/auth/google/callback',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'],
    state: true
};

const googleStrategy = new GoogleStrategy(options, async (accessToken, refreshToken, profile, cb) => {

    let user = await User.findOne({ "googleAuth.id": profile.id });
    if (!user) {
        let userna = profile.displayName.split(' ')
        const psn = uuidv4().replace(/-/g, '').slice(0, 8);
        user = new User({
            googleAuth: { id: profile.id },
            provider: "google",
            name: profile.displayName,
            fullName: profile.displayName,
            picture:profile.photos[0].value,
            email: profile.emails[0].value,
            psn
        });

        await user.save();

    }
    const playload = {
        exp: moment().add(process.env.JWT_EXPIRATION_MINUTES, 'minutes').unix(),
        iat: moment().unix(),
        sub: user._id
    };

    const access = jwt.sign(playload, process.env.JWT_SECRET);
    user.googleAuth.accessToken = access;

    await user.save()
    
    return cb(null, user);
});



const facebookStrategy = new FacebookStrategy({
    clientID: appId,
    clientSecret: appSecret,
    callbackURL: 'https://seragii.com/api/v1/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email'], // Specify the profile fields you need
    scope: ['user_photos', 'user_profile'],
    state: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ "facebookAuth.id": profile.id });
        console.log(profile);
        if (!user) {
            let userna = profile.displayName.split(' ');
            const psn = uuidv4().replace(/-/g, '').slice(0, 8);

            user = new User({
                facebookAuth: { id: profile.id },
                provider:"facebook",
                name: profile.displayName,
                fullName: profile.displayName,
                picture:profile.photos[0].value,
                email: profile.emails[0].value,
                psn
            });
            await user.save();
        }
        const playload = {
            exp: moment().add(process.env.JWT_EXPIRATION_MINUTES, 'minutes').unix(),
            iat: moment().unix(),
            sub: user._id
        };
    
        const access = jwt.sign(playload, process.env.JWT_SECRET);
        user.facebookAuth.accessToken = access;
    
        await user.save()

        return done(null, user);
    } catch (error) {
        console.log(error);
        return done("failed",error);
    }
});


passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id).catch((err) => {
        return done(err, null);
    });

    if (user) done(null, user);
});

module.exports = {
    googleStrategy,
    facebookStrategy
}