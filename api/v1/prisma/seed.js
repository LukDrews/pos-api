const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Users
  const users = [
    {
      firstName: "John",
      lastName: "Doe",
      birthDate: new Date("1990-12-24"),
    },
    {
      firstName: "Max",
      lastName: "Musterman",
      birthDate: new Date("2000-01-31"),
    },
    {
      firstName: "Test",
      lastName: "User",
      birthDate: new Date(),
    },
  ];
  // Roles
  const roleNames = ["LaKi", "Teamer*in", "admin"];
  for (let name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
      },
    });
  }
  // Groups
  const groupNames = ["Team 1", "Team 2", "Team 3"];
  for (let idx in groupNames) {
    let name = groupNames[idx];
    await prisma.group.upsert({
      where: { name },
      update: {},
      create: {
        name,
        users: {
          create: [
            {
              ...users[idx],
              role: {
                connect: {
                  name: roleNames[idx],
                },
              },
            },
          ],
        },
      },
    });
  }
  // Products
  const products = [
    {
      name: "Snickers",
      price: 100,
      barcode: "1570315473264",
    },
    {
      name: "Mars",
      price: 110,
      barcode: "8071683040857",
    },
    {
      name: "Twix",
      price: 140,
      barcode: "5457459429383",
    },
  ];
  for (let idx in products) {
    const product = products[idx];
    products[idx] = await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  // Cart items
  for (let idx in products) {
    const product = products[idx];
    const cartItem = await prisma.cartItem.upsert({
      where: { productUuid: product.uuid },
      update: {},
      create: {
        product: {
          connect: {
            uuid: product.uuid,
          },
        },
        count: Number(idx) + 1,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
