const express = require("express");
const multer = require("multer");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const { initialize } = require("express-openapi");
const Dinero = require("dinero.js");
const { PrismaClient, Prisma } = require("@prisma/client");

const v1ApiDoc = require("./api/v1/api-doc");
const debug = require("debug")("api");
const errDebug = debug.extend("error");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use("/static", express.static("./uploads"));
app.use("/static", express.static("./public"));
fs.access("./uploads", (error) => {
  if (error) {
    fs.mkdirSync("./uploads");
  }
});

app.use(cors());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));

const prisma = new PrismaClient();
// create openapi-config
initialize({
  app,
  apiDoc: { ...v1ApiDoc },
  dependencies: { debug, db: prisma, Prisma, Dinero },
  paths: "./api/v1/routes",
  consumesMiddleware: {
    "application/json": express.json(),
    "multipart/form-data": function (req, res, next) {
      upload.any()(req, res, function (err) {
        if (err) {
          return next(err);
        }
        // Handle both single and multiple files
        const filesMap = req.files.reduce(
          (acc, f) =>
            Object.assign(acc, {
              [f.fieldname]: (acc[f.fieldname] || []).concat(f),
            }),
          {}
        );
        Object.keys(filesMap).forEach((fieldname) => {
          const files = filesMap[fieldname];
          req.body[fieldname] = files.length > 1 ? files.map(() => "") : "";
        });
        return next();
      });
    },
  },
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
