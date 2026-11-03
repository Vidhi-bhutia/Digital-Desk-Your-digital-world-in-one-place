const config = require('../config/env');

const sendVerificationCode = async (phone, code, purpose = 'verify your number') => {
  const { accountSid, authToken, fromNumber } = config.twilio;
  if (!accountSid || !authToken || !fromNumber) { const error = new Error('Phone verification is not configured. Add Twilio credentials to the backend environment.'); error.status = 503; throw error; }
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: phone, From: fromNumber, Body: `Your Digital Desk code to ${purpose} is ${code}. It expires in 10 minutes. If you did not request this, ignore this message.` }),
  });
  if (!response.ok) { const data = await response.json().catch(() => ({})); const error = new Error(data.message || 'The verification SMS could not be sent.'); error.status = 502; throw error; }
  return true;
};
module.exports = { sendVerificationCode };
