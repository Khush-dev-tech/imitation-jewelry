import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/passwords";
import { CATEGORIES } from "../lib/categories";

/**
 * Seed data — Backend Schema §13:
 * - One admin_users row, "not left as a default/guessable credential."
 * - site_settings seeded with a single row.
 * - categories seeded with the PRD's main product categories.
 * - No sample/demo products (the business supplies real catalogue data).
 */

const prisma = new PrismaClient();

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "owner@marutiimitationjewelry.com";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists (${email}) — skipping.`);
    return;
  }

  // Never hardcode a default password. Use SEED_ADMIN_PASSWORD if the
  // business has set one; otherwise generate a random one and print it
  // ONCE — it is not stored anywhere in the codebase.
  const password = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
  const passwordHash = await hashPassword(password);

  await prisma.adminUser.create({
    data: { name: "Business Owner", email, passwordHash },
  });

  console.log("\n=== Admin account created ===");
  console.log(`Email:    ${email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Password: ${password}`);
    console.log("(Generated — save this now, it will not be shown again.)");
  } else {
    console.log("Password: (set via SEED_ADMIN_PASSWORD)");
  }
  console.log("==============================\n");
}

async function seedSiteSettings() {
  const existing = await prisma.siteSetting.findFirst();
  if (existing) {
    console.log("Site settings already seeded — skipping.");
    return;
  }
  await prisma.siteSetting.create({ data: {} }); // schema defaults match App Brief exactly
  console.log("Site settings seeded.");
}

async function seedCategories() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { name: category.name, slug: category.slug },
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

async function main() {
  await seedAdminUser();
  await seedSiteSettings();
  await seedCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
