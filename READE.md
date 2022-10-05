# xramile-backend

## Description
A Backend Server as part of xramile hiring process( based on `node.js` and `express` framework) using `MongoDB` as a database provider and `mongoose` as ODM.


## Features
* Authenticate and authorize users by `JWT token AND express-session`.
* Custom middleware authorization middleware.
* Each service is independent which together makes a scalable structure

## Installation instructions
* Install Redis on Ubuntu Using the APT.
```
apt install redis.
```
* Install the dependencies with `npm` package manager
```
$ npm install
```
* Set environment variables

## Environment Variables 
> src/config/env.js
```
PORT=8080
DBURI           #local connection mongodb url   mongodb://[username:password@]host1[:port1]
DBURI_REMOTE    #remote mongodb database for production
DBURI_TEST      #mongodb database for testing
TOKENWORD       #secret word to hash jwt
REDIS_URL       #redis connection url     redis://[[usernamepassword@]host[:port][/database]
NODE_ENV        #node environment variable
```
## Executing program
* The website works on `http://localhost:process.env.PORT || 8080` OR by `nodemon` which is run in development mode with monitoring of debugging terminal.
>npm run scripts
```
"scripts": {
  "start": "NODE_ENV=prod node index.js",
  "prettier": "prettier --config .prettierrc.yaml './**/*.js'  --write",
  "eslint": "eslint -c .eslintrc.yml .",
  "dev": "NODE_ENV=dev nodemon index.js 5050",
  "prod": "NODE_ENV=prod node index.js",
  "test": "NODE_ENV=test jasmine"
},
```
## Postman collection and API
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/17898602-b32dfdce-3714-4637-aed6-5d7352f08d6c?action=collection%2Ffork&collection-url=entityId%3D17898602-b32dfdce-3714-4637-aed6-5d7352f08d6c%26entityType%3Dcollection%26workspaceId%3D1ad02d40-7228-4da8-80e5-df262b9c0e31)

## Directory Structure

```
.
|_node_modules/
|_spec/
  |_*.spec.js             #test-case specs files
|_src/
  |_config/
  |_middelwares/           #custom middlewares
  |_services/              #app services
    |_A/
    |_A.model.js
    |_A.controllers.js            
    |_A.routes.js
  |_utils
  |_index.routes.js
|
|
|_index.js
|_.env
|_.gitignore
|_package.json
|_README.md
```
