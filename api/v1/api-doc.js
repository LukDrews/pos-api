const exampleProductBarcode = "4250519647265";

const apiDoc = {
  openapi: "3.0.0",
  info: {
    title: "POS-API",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000/v1",
    },
  ],
  paths: {},
  components: {
    schemas: {
      Group: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Group 1",
          },
        },
        required: ["name"],
      },
      Product: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Snicker",
          },
          price: {
            type: "integer",
            example: 100,
          },
          barcode: {
            $ref: "#/components/schemas/ProductBarcode",
          },
        },
      },
      ProductBarcode: {
        type: "string",
        format: "productBarcode",
        example: exampleProductBarcode,
      },
      ProductBarcodeSelect: {
        title: "ProductBarcodeSelect",
        type: "object",
        properties: {
          barcode: {
            $ref: "#/components/schemas/ProductBarcode",
          },
        },
        required: ["barcode"],
      },
      Role: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "customer",
          },
        },
        required: ["name"],
      },
      User: {
        type: "object",
        properties: {
          firstName: {
            type: "string",
            example: "Max",
          },
          lastName: {
            type: "string",
            example: "Mustermann",
          },
          birthDate: {
            type: "string",
            format: "date",
            example: "2017-07-21",
          },
          roleUuid: {
            type: "string",
          },
          groupUuid: {
            type: "string",
            format: "uuid",
          },
          barcode: {
            type: "string",
            format: "userBarcode",
          },
          generateBarcode: {
            type: "string",
            enum: ["true", "false"],
            default: "true",
          },
          image: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
    parameters: {
      ProductBarcodeParameter: {
        name: "barcode",
        in: "path",
        schema: {
          type: "string",
          format: "productBarcode",
          example: exampleProductBarcode,
          // This should work
          // $ref: "#/components/schemas/ProductBarcode",
        },
        required: true,
        description: "Barcode of a product",
      },
    },
    requestBodies: {
      GroupBody: {
        description: "",
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Group",
            },
          },
        },
      },
    },
  },
};

module.exports = apiDoc;
