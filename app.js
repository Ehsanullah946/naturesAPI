const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError');
const globalErrorController = require('./controller/errorController');

const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/ReviewRoutes');
const viewRouter = require('./routes/viewRoutes');
// console.log(process.env.NODE_ENV);

// global middleware

// set scurity http headers
app.use(helmet());

// data sanitization against sql injection
app.use((req, res, next) => {
  req.body && mongoSanitize.sanitize(req.body);
  req.params && mongoSanitize.sanitize(req.params);
  req.query && mongoSanitize.sanitize(req.query);
  next();
});

// data sanitization against xss hacking
// app.use(xss());

// preventing parameter pullotion

app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'price'],
  }),
);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser, reading data from the req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//...............................................................
// this middleware limit the amount of request that comes from on IP

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100, // one houre
  message: 'too many request from this IP please try again after a houre',
});

app.use('/api', limiter);

//.......................................................................

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// app.post('/api/v1/tours',createTour);
// app.get('/api/v1/tours',getAllTours);
// app.get('/api/v1/tours/:id',getTour );
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour );

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use((req, res, next) => {
  // const err = new Error(`we can't find ${req.originalUrl} into routh`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(` can't find ${req.originalUrl} into routh`, 404));
});

app.use(globalErrorController);

module.exports = app;
