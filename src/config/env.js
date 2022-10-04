require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  DBURI: process.env.DBURI,
  DBURI_REMOTE: process.env.DBURI_REMOTE,
  TOKENWORD: process.env.TOKENWORD,
  REDIS_URL: process.env.REDIS_URL,
  NODE_ENV: process.env.NODE_ENV,
};
