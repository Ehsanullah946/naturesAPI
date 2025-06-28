const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const slugify = require('slugify');
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('db connection successful');
  });

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'the tour should have a name'],
      minlength: [10, 'the name should have above 10 charecters'],
      maxlength: [40, 'the name should have less than 40 charecter'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour should have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour should have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour should have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: ['the diffic should have easy, medium and difficulty'],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'the the avg should be above 1.0'],
      max: [5, 'the rating should be less than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'the tour should have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'the priceDiscount ({VALUES}) should blow than the price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour should a summary'],
    },
    discription: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour should have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//  Document middleware:runs before .save() and create() function
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

//  middleware query
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`this middleware took ${Date.now() - this.start} melliscond`);
  console.log(docs);
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline);
  next();
});

const Tour = new mongoose.model('Tour', tourSchema);
module.exports = Tour;
