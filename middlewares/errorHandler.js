const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({
    error: {
      message: err.message || 'Something went wrong!',
      status: err.status || 500
    }
  });
};

module.exports = errorHandler;