const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const slugify = require('slugify');
const User = require('./userModel');
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
      // enum: {
      //   values: ['easy', 'medium', 'difficulty'],
      //   message: 'the diffic should have easy, medium and difficulty',
      // },
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
        message:
          'The price discount ({VALUE}) should be below the regular price',
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populated  برعکس کردن رابطه tour , review

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
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

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//  middleware query  it defines the relationship between tour and user

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    // select: -__v - changePasswordAt,
  });
  next();
});

/// create indexes for tour model

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

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
