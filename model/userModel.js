const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'plaese tell use your password'],
    minlenght: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validator: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  changePasswordAt: Date,
  role: {
    type: String,
    enum: ['user', 'guid', 'lead-guid', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  if (!this.isNew) {
    this.changePasswordAt = Date.now() - 1000; // avoid token timing issues
  }
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changePasswordAt = Date.now() - 1000;
  next();
});
// it is a function that check that the user password that stored before and the user password that
// now it give to the system and bcrybt this and compare
userSchema.methods.correctPassword = async function (
  condidatepassword,
  userPassword,
) {
  return await bcrypt.compare(condidatepassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.changePasswordAt) {
    const changeTimestamp = parseInt(
      this.changePasswordAt.getTime() / 1000,
      10,
    );
    console.log(this.changePasswordAt, JWTTimestamp);
    return JWTTimestamp < changeTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = new mongoose.model('User', userSchema);
module.exports = User;
