const fs = require('fs');
const path = require('path');

const successfulRes = (res, status, data, msg = 'success') => {
  return res.status(status).json({
    status: status,
    msg: msg,
    data: data,
  });
};

const failedRes = (res, status, error = null, msg = 'error') => {
  const logLine = `\n[${status}] ${error.message}`;
  console.error(logLine);
  console.log(error.stack);

  const logFile = path.join(path.normalize(`${__dirname}/../../`), 'log.txt');
  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error(err);
    }
  });

  res.status(status).json({
    status: status,
    msg: msg,
    data: error?.message,
  });
  if (status == 500) {
    process.exit(1);
  }
};

module.exports = {
  successfulRes,
  failedRes,
};
