const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: { type: String, default: '', trim: true, maxlength: 24 },
    phoneNormalized: { type: String, default: null, select: false },
    phoneVerifiedAt: { type: Date, default: null },
    pendingPhone: { type: String, default: '', select: false },
    phoneVerificationOtpHash: { type: String, default: null, select: false },
    phoneVerificationOtpExpires: { type: Date, default: null, select: false },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationOtpHash: { type: String, default: null, select: false },
    emailVerificationOtpExpires: { type: Date, default: null, select: false },
    emailVerificationOtpAttempts: { type: Number, default: 0, select: false },
    emailVerificationOtpSentAt: { type: Date, default: null, select: false },
    accountDeletionOtpHash: { type: String, default: null, select: false },
    accountDeletionOtpExpires: { type: Date, default: null, select: false },
    accountDeletionOtpAttempts: { type: Number, default: 0, select: false },
    accountDeletionOtpSentAt: { type: Date, default: null, select: false },
    notificationPreferences: { type: mongoose.Schema.Types.Mixed, default: () => ({ enabled: true, inApp: true, email: false, desktop: false, sound: false, categories: { tasks: true, integrations: true, security: true, system: true }, completedTasks: false }) },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    // OAuth & Service Tokens
    githubUsername: { type: String, default: '' },
    githubAccessToken: { type: String, default: '', select: false },
    googleEmail: { type: String, default: '' },
    googleAccessToken: { type: String, default: '', select: false },
    googleRefreshToken: { type: String, default: '', select: false },
    musicState: { type: mongoose.Schema.Types.Mixed, default: null },
    
    // Password Reset
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
    passwordResetOtpHash: { type: String, default: null, select: false },
    passwordResetOtpExpires: { type: Date, default: null, select: false },
    passwordResetOtpAttempts: { type: Number, default: 0, select: false },
    passwordResetOtpSentAt: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to normalize email and ensure trim
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

userSchema.index({ phoneNormalized: 1 }, { unique: true, partialFilterExpression: { phoneVerifiedAt: { $type: 'date' } } });

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static method to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Custom JSON output to ensure sensitive fields are never leaked
userSchema.methods.toAuthUser = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    emailVerifiedAt: this.emailVerifiedAt || null,
    notificationPreferences: this.notificationPreferences || { enabled: true, inApp: true, email: false, desktop: false, sound: false, categories: { tasks: true, integrations: true, security: true, system: true }, completedTasks: false },
    avatar: this.avatar || '',
    githubUsername: this.githubUsername || '',
    googleEmail: this.googleEmail || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
