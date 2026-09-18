import mongoose, { Schema, Document } from 'mongoose';

export interface IOAuthToken extends Document {
  user: mongoose.Types.ObjectId;
  provider: 'github' | 'google';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OAuthTokenSchema: Schema<IOAuthToken> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['github', 'google'],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    scope: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one token per provider per user
OAuthTokenSchema.index({ user: 1, provider: 1 }, { unique: true });

export const OAuthToken = mongoose.model<IOAuthToken>('OAuthToken', OAuthTokenSchema);
