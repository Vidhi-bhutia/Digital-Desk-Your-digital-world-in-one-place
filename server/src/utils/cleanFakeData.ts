import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { NormalizedEvent } from '../models/NormalizedEvent';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const cleanFakeData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not defined in environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB database');

    const fakeTitles = [
      'Team Design & Architecture Sync',
      'Product Deployment Checklist Review',
      '1-on-1 Engineering Check-in',
      'Team Product & Architecture Sync',
      'Commit pushed to digital-desk',
      'Email received from Team',
      'Team Product Sync Meeting',
      'Pull Request opened #42',
    ];

    const result = await NormalizedEvent.deleteMany({
      $or: [
        { title: { $in: fakeTitles } },
        { externalId: { $regex: /^fake_|^seed_|^demo_/i } },
      ],
    });

    console.log(`Cleaned ${result.deletedCount} synthetic/demo records from NormalizedEvent collection.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Data cleaning error:', err);
    process.exit(1);
  }
};

cleanFakeData();
