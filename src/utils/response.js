const successfulRes = (res, status, data, msg = 'success') => {
  return res.status(status).json({
    status,
    msg,
    data,
  });
};

const failedRes = (res, status, error = null, msg = 'error') => {
  res.status(status).json({
    status,
    msg,
    data: error?.message,
  });
  if (status === 500) {
    process.exit(1);
  }
};

module.exports = {
  successfulRes,
  failedRes,
};
