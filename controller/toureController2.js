const fs = require('fs');

const Tour = require('../model/tourModel');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.CheckedID = (req, res, next, val) => {
  console.log(`the id is : ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
};

exports.CheckBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid body',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      result: tours.length,
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  console.log(req.requestTime);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  console.log(req.params);
  res.status(200).json({
    status: 'success',
    data: {
      tours: tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (error) => {
      res.status(201).json({
        status: 'success',
        tour: newTour,
      });
    },
  );
};

exports.updateTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.deleteTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'deleted successfuly',
    },
  });
};
