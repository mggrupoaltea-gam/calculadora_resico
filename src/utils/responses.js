// ============================
// 🎯 UTILS: responses.js
// Centraliza las respuestas del servidor
// ============================

module.exports = {
  success: (res, message, data = null) => {
    return res.status(200).json({
      status: 'success',
      message,
      data
    });
  },

  created: (res, message, data = null) => {
    return res.status(201).json({
      status: 'created',
      message,
      data
    });
  },

  badRequest: (res, message, errors = []) => {
    return res.status(400).json({
      status: 'error',
      message,
      errors
    });
  },

  serverError: (res, message) => {
    return res.status(500).json({
      status: 'error',
      message
    });
  }
};
