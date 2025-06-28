const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError');
const globalErrorController = require('./controller/errorController');

const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');
// console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// middleware

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.post('/api/v1/tours',createTour);
// app.get('/api/v1/tours',getAllTours);
// app.get('/api/v1/tours/:id',getTour );
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour );

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use((req, res, next) => {
  // const err = new Error(`we can't find ${req.originalUrl} into routh`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(` can't find ${req.originalUrl} into routh`, 404));
});

app.use(globalErrorController);

module.exports = app;
