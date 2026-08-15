const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "84agarwalharshit@gmail.com";
  const password = "gdgcweb";

  const passwordHash = await bcrypt.hash(password, 12);

  // Clean up any typo record if exists
  await prisma.adminUser.deleteMany({
    where: { email: "84agarwalharshit@gmai.com" }
  });

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      name: "Harshit Agarwal",
    },
    create: {
      email: email.toLowerCase(),
      name: "Harshit Agarwal",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("SUPER_ADMIN ready:", admin.email, "role:", admin.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());