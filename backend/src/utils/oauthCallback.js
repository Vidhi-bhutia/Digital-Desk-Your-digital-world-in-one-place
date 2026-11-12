// Production OAuth must return through the same /api proxy that set the
// browser's state and auth cookies. Separate Vercel projects cannot share them.
const oauthCallbackUrl = ({ callbackUrl, frontendUrl, backendUrl, nodeEnv, provider }) => {
  const fallbackPath = `/api/integrations/${provider}/callback`;
  if (nodeEnv !== 'production') return callbackUrl || new URL(fallbackPath, backendUrl).href;

  const callback = new URL(callbackUrl || fallbackPath, frontendUrl);
  const frontend = new URL(frontendUrl);
  callback.protocol = frontend.protocol;
  callback.host = frontend.host;
  callback.username = '';
  callback.password = '';
  return callback.href;
};

module.exports = { oauthCallbackUrl };
