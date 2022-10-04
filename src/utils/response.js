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
};

module.exports = {
  successfulRes,
  failedRes,
};
