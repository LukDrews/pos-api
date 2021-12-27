const express = require("express");
const logger = require("morgan");
const debug = require("debug")("api");
const { initialize } = require("express-openapi");
const v1ApiDoc = require("./api/v1/api-doc");

const { sequelize, Sequelize } = require("./api/v1/models");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// create openapi-config
initialize({
  app,
  apiDoc: { ...v1ApiDoc },
  dependencies: { debug, db: sequelize, Sequelize },
  paths: "./api/v1/routes",
});

module.exports = app;
