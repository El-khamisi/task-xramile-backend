const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);
const morgan = require('morgan');
const { TOKENKEY, DBURI, DBURI_REMOTE, NODE_ENV, REDIS_URL } = require('./config/env');

const login = require('./services/login/login.routes');
const post = require('./services/posts/posts.routes');

module.exports = async (app) => {
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('dev'));

  // Configure redis client
  const redisClient = new Redis(REDIS_URL);
  redisClient.on('error', (err) =>
    console.log('Could not establish a connection with redis. ' + err)
  );
  redisClient.on('connect', () => console.log('Connected to redis successfully'));

  if (NODE_ENV === 'dev') {
    mongoose
      .connect(DBURI)
      .then(() => {
        console.log('connected to local database successfully');
      })
      .catch(() => {
        console.log("can't connect to local database");
      });
  } else {
    mongoose
      .connect(DBURI_REMOTE)
      .then(() => {
        console.log('connected to production database successfully');
      })
      .catch(() => {
        console.log("can't connect to production database");
      });
  }

  //  CORS all origins for development -- REMOVE when you go to production
  app.use(
    cors({
      origin: function (origin, cb) {
        cb(null, origin);
      },
      credentials: true,
    })
  );
  app.options('*', (req, res) => res.end());

  app.enable('trust proxy');
  app.use(
    session({
      name: 's_id',
      secret: TOKENKEY,
      store: new RedisStore({ client: redisClient }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days OR TWO WEEKS
        sameSite: NODE_ENV === 'dev' ? '' : 'none',
        secure: !(NODE_ENV === 'dev'),
      },
    })
  );

  // Routers
  app.use(login);
  app.use(post);

  // Caught uncaughtExceptions
  process.on('uncaughtException', (error) => {
    console.error(error);
    process.exit(1);
  });
};
