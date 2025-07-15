const AppError = require('../utils/appError');
const catchAsynch = require('../utils/catchAsynch');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsynch(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('not finde that doc', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsynch(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('not found any doc with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsynch(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsynch(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;

    if (!doc) {
      return next(new AppError('the document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsynch(async (req, res, next) => {
    // this part of code will finde all the reviews that belongs to the tour that specify the id in the ulr
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //...........................................................
    // this line is for get all tour actully for all of them but specific for get tours with features
    const features = new APIFeatures(Model.find(filter), req.query)
      .Filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await features.query;
    // 6. Send response
    res.status(200).json({
      status: 'success',
      resutl: doc.length,
      data: { doc },
    });
  });
