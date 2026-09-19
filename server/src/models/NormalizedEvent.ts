import mongoose, { Schema, Document } from 'mongoose';

export interface INormalizedEvent extends Document {
  user: mongoose.Types.ObjectId;
  source: 'github' | 'gmail' | 'calendar';
  provider: 'github' | 'google';
  eventType: 'commit' | 'pr' | 'issue' | 'email' | 'calendar_event';
  externalId: string;
  timestamp: Date;
  fetchedAt: Date;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NormalizedEventSchema: Schema<INormalizedEvent> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['github', 'gmail', 'calendar'],
      required: true,
    },
    provider: {
      type: String,
      enum: ['github', 'google'],
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user, provider, and external item
NormalizedEventSchema.index({ user: 1, provider: 1, externalId: 1 }, { unique: true });
NormalizedEventSchema.index({ user: 1, timestamp: -1 });

export const NormalizedEvent = mongoose.model<INormalizedEvent>('NormalizedEvent', NormalizedEventSchema);
