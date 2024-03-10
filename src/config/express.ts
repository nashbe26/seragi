export {};
import * as express from 'express';
import { facebookStrategy, googleStrategy } from '../api/middlewares/conf';
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const routes = require('../api/routes/v1');
const { logs, UPLOAD_LIMIT } = require('./vars');
const strategies = require('./passport');
const error = require('../api/middlewares/error');

/**
 * Express instance
 * @public
 */
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

app.use('/uploads', express.static('uploads'));

// parse body params and attache them to req.body
app.use(express.json({ limit: `${UPLOAD_LIMIT}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${UPLOAD_LIMIT}mb` }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// --- NOTE: for testing in DEV, allow Access-Control-Allow-Origin: (ref: https://goo.gl/pyjO1H)
// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });
const session = require('express-session');

app.use(session({
	secret: 'bA2xcjpf8y5aSUFsNB2qN5yymUBSs6es3qHoFpGkec75RCeBb8cpKauGefw5qy4',
	resave: true,
	saveUninitialized: true,
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use((req: any, res: express.Response, next: express.NextFunction) => {
  req.uuid = `uuid_${Math.random()}`; // use "uuid" lib
  next();
});

// enable authentication
app.use(passport.initialize());
passport.use('jwt', strategies.jwt);
passport.use("google",googleStrategy);
passport.use("facebook",facebookStrategy);

// mount api v1 routes
app.use('/api/v1', routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
