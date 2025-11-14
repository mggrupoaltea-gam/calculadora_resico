require('dotenv').config();

module.exports = function apiKeyMiddleware(req, res, next) {
  const userKey = req.headers['x-api-key'];

  if (!userKey) {
    return res.status(401).json({ error: 'API Key requerida' });
  }

  if (userKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'API Key inválida' });
  }

  next();
};
