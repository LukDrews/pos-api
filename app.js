const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { initialize } = require("express-openapi");
const Dinero = require("dinero.js");
const v1ApiDoc = require("./api/v1/api-doc");
const debug = require("debug")("api");
const errDebug = debug.extend("error");

const { sequelize, Sequelize } = require("./api/v1/models");

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// create openapi-config
initialize({
  app,
  apiDoc: { ...v1ApiDoc },
  dependencies: { debug, db: sequelize, Sequelize, Dinero },
  paths: "./api/v1/routes",
  errorMiddleware: function (err, req, res, next) {
    errDebug(err);
    if (err.status) {
      res.status(err.status).json(err);
    } else {
      res.status(500).json(err);
    }
  },
});

module.exports = app;
