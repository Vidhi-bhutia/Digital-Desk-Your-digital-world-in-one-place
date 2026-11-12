const { test } = require('node:test');
const assert = require('node:assert/strict');
const { oauthCallbackUrl } = require('../utils/oauthCallback');

const production = {
  nodeEnv: 'production',
  frontendUrl: 'https://digital-desk-fe.vercel.app',
  backendUrl: 'https://digital-desk-be.vercel.app',
};

for (const provider of ['github', 'google']) {
  test(`${provider}: production defaults to the frontend cookie origin`, () => {
    assert.equal(oauthCallbackUrl({ ...production, provider }),
      `${production.frontendUrl}/api/integrations/${provider}/callback`);
  });

  test(`${provider}: a backend callback is corrected without losing its route`, () => {
    const path = `/api/auth/${provider}/callback`;
    assert.equal(oauthCallbackUrl({ ...production, provider, callbackUrl: `${production.backendUrl}${path}` }),
      `${production.frontendUrl}${path}`);
  });

  test(`${provider}: local callback configuration stays unchanged`, () => {
    const callbackUrl = `http://localhost:5000/api/integrations/${provider}/callback`;
    assert.equal(oauthCallbackUrl({ ...production, nodeEnv: 'development', provider, callbackUrl }), callbackUrl);
    assert.equal(oauthCallbackUrl({ nodeEnv: 'development', backendUrl: 'http://localhost:5000', provider }), callbackUrl);
  });
}
