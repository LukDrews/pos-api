# pos-api

## **Install**
#### **Development**
```sh
npm install
npm run migrate # create database
npm run dev
```

#### **Open database browser**
```sh
npx prisma studio
```

## Barcodes
#### **EAN-8/GTIN-8**

- C -> Country Code 
- X -> Product/Data digits 
- Y -> Checksum

Format: CCCX XXXY

Country Codes:
- Prefix 952 - Used for demonstrations and examples of the GS1 system
- Data: 1337
- Checksum: 8 ([Check digit alculator](https://www.gs1.org/services/check-digit-calculator))

Example: 9521 3378

Sources: [neodynamic.com](https://www.neodynamic.com/Products/Help/BarcodeWP1.0/barcodes/Ean8.htm),[Wikipedia]()

#### **EAN-13/GTIN-13**
*Coming soon...*