const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "84agarwalharshit@gmai.com";
  const password = "gdgcweb";

  const existing = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      email: email.toLowerCase(),
      name: "Harshit Agarwal",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("SUPER_ADMIN created:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());