const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

test.before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  await User.deleteMany({});
});

test.after(async () => {
  await User.deleteMany({});
  await disconnectDB();
});

test('User registration, duplicate check & authentication flow', async (t) => {
  await t.test('Register new user successfully', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@digitaldesk.app',
      passwordHash: await User.hashPassword('Password123!'),
    });

    assert.equal(user.name, 'Test User');
    assert.equal(user.email, 'test@digitaldesk.app');
    assert.ok(user.createdAt);
  });

  await t.test('Duplicate email registration should fail', async () => {
    try {
      await User.create({
        name: 'Duplicate User',
        email: 'TEST@digitaldesk.app', // Should normalize email to lower case
        passwordHash: await User.hashPassword('Password123!'),
      });
      assert.fail('Should have thrown duplicate email error');
    } catch (err) {
      assert.ok(err.code === 11000 || err.name === 'MongoServerError');
    }
  });

  await t.test('Password matching logic', async () => {
    const user = await User.findOne({ email: 'test@digitaldesk.app' }).select('+passwordHash');
    assert.ok(user);
    const isValid = await user.comparePassword('Password123!');
    assert.equal(isValid, true);
    const isInvalid = await user.comparePassword('WrongPassword');
    assert.equal(isInvalid, false);
  });

  await t.test('User output sanitization', async () => {
    const user = await User.findOne({ email: 'test@digitaldesk.app' });
    const authUser = user.toAuthUser();
    assert.equal(authUser.email, 'test@digitaldesk.app');
    assert.equal(authUser.passwordHash, undefined);
    assert.equal(authUser.passwordResetTokenHash, undefined);
  });
});
