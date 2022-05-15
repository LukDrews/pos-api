// Express related imports
process.env.DEBUG="*"
const express = require("express");
const multer = require("multer");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require('path');
const { initialize } = require("express-openapi");
const v1ApiDoc = require("./api/v1/api-doc");
const customFormats = require("./libs/customFormats");

// Utility imorts
const { PrismaClient, Prisma } = require("./libs/generated/client");
const Dinero = require("dinero.js");
const Services = require("./api/v1/services");
const debug = require("debug");
const apiDebug = debug("api");
const errDebug = apiDebug.extend("error");

const prisma = new PrismaClient();
const services = Services.create(prisma, debug("service"));

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// app.use("/static", express.static("./public"));
// app.use("/static", express.static("./uploads"));
// fs.access("./uploads", (error) => {
//   if (error) {
//     fs.mkdirSync("./uploads", { recursive: true });
//   }
// });

app.use(cors());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
// app.use(services.authenticationService.validateToken());

// create openapi-config
initialize({
  app,
  apiDoc: { ...v1ApiDoc },
  dependencies: { debug: apiDebug, db: prisma, ...services, Prisma, Dinero },
  paths: path.join(__dirname, "./api/v1/routes"),
  customFormats: customFormats,
  consumesMiddleware: {
    "application/json": express.json(),
    "multipart/form-data": function (req, res, next) {
      upload.any()(req, res, function (err) {
        if (err) return next(err);
        if (req.files.length === 0) return next();

        // Merge multiple files into one field as an array
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
