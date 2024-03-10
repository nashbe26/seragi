export {};
import { NextFunction, Request, Response, Router } from 'express';
const httpStatus = require('http-status');
import { User } from '../../api/models';
const RefreshToken = require('../models/refreshToken.model');
const Wallet = require('../models/userWallet.model');
const moment = require('moment-timezone');
import { apiJson, randomString } from '../../api/utils/Utils';
import { sendEmail, welcomeEmail, forgotPasswordEmail, slackWebhook } from '../../api/utils/MsgUtils';
const { SEC_ADMIN_EMAIL, JWT_EXPIRATION_MINUTES, slackEnabled, emailEnabled } = require('../../config/vars');
const uuidv4 = require('uuid/v4');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user: any, accessToken: string) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(JWT_EXPIRATION_MINUTES, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);

    const psn = uuidv4().replace(/-/g, '').slice(0, 8);
    req.body.psn = psn;

    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'FR',
      email: req.body.email,
      capabilities: {
      transfers: {
          requested: true,
      },
      card_payments: {
          requested: true,
        },
      }
  });

    const user = new User(req.body);
    user.bank_acc = account.id
    await user.save()
    
    const wallet = new Wallet({ user: user._id });
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());

    res.status(httpStatus.CREATED);
    const data = { token, user: userTransformed };

    return apiJson({ req, res, data });
  } catch (error) {
    console.log(error);

    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const { email } = user;
    const token = generateTokenResponse(user, accessToken);

    if (email === SEC_ADMIN_EMAIL) {
      // setAdminToken(token); // remember admin token for checking later
    } else {
      const { ip, headers } = req;
      slackWebhook(`User logged in: ${email} - IP: ${ip} - User Agent: ${headers['user-agent']}`);
    }
    const userTransformed = user.transform();
    const data = { token, user: userTransformed };
    return apiJson({ req, res, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Logout function: delete token from DB.
 * @public
 */
exports.logout = async (req: Request, res: Response, next: NextFunction) => {
  console.log('- logout');
  try {
    const { userId } = req.body;
    console.log(userId);
    
    await RefreshToken.findAndDeleteToken({ userId });
    const data = { status: 'OK' };
    return apiJson({ req, res, data });
  } catch (error) {
    console.log(error);
    
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    user.psn = uuidv4();
    console.log('user psn', user.psn);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

/**
 * Send email to a registered user's email with a one-time temporary password
 * @public
 */
exports.forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email: reqEmail } = req.body;
    const user = await User.findOne({ email: reqEmail });
    if (!user) {
      // RETURN A GENERIC ERROR - DON'T EXPOSE the real reason (user not found) for security.
      return next({ message: 'Invalid request' });
    }
    // user found => generate temp password, then email it to user:
    const { name, email } = user;
    const tempPass = randomString(10, 'abcdefghijklmnopqrstuvwxyz0123456789');
    user.tempPassword = tempPass;
    await user.save();
    sendEmail(forgotPasswordEmail({ name, email, tempPass }));

    return apiJson({ req, res, data: { status: 'OK' } });
  } catch (error) {
    return next(error);
  }
};
