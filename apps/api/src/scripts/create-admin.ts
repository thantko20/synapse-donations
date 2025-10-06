#!/usr/bin/env tsx

import { prisma } from "../../prisma/index.js";
import bcrypt from "bcrypt";
import { type CreateAdminInput, createAdminSchema } from "@repo/shared/schemas";

async function createAdmin(input: CreateAdminInput) {
  try {
    await createAdminSchema.parseAsync(input);
    // Check if admin with this email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: input.email },
    });

    if (existingAdmin) {
      console.error(`❌ Admin with email "${input.email}" already exists.`);
      process.exit(1);
    }

    // Validate password length (matching the login schema validation)
    if (input.password.length < 8) {
      console.error("❌ Password must be at least 8 characters long.");
      process.exit(1);
    }

    if (input.password.length > 16) {
      console.error("❌ Password must be no more than 16 characters long.");
      process.exit(1);
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // Create the admin user
    const admin = await prisma.admin.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log(`📅 Created: ${admin.createdAt.toISOString()}`);
  } catch (error) {
    console.error("❌ Failed to create admin user:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function showHelp() {
  console.log(`
🔧 Create Admin User Script

Usage:
  tsx src/scripts/create-admin.ts --email <email> --name <name> --password <password>
  tsx src/scripts/create-admin.ts --help

Options:
  --email <email>        Admin email address (must be unique)
  --name <name>          Admin full name
  --password <password>  Admin password (8-16 characters)
  --help                 Show this help message

Examples:
  tsx src/scripts/create-admin.ts --email admin@example.com --name "John Doe" --password "securepassword123"
  tsx src/scripts/create-admin.ts --email admin@myorg.com --name "Jane Smith" --password "adminpass456"
`);
}

function parseArgs(): CreateAdminInput | null {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  let email = "";
  let name = "";
  let password = "";

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    if (!value) {
      console.error(`❌ Missing value for ${flag}`);
      return null;
    }

    switch (flag) {
      case "--email":
        email = value;
        break;
      case "--name":
        name = value;
        break;
      case "--password":
        password = value;
        break;
      default:
        console.error(`❌ Unknown flag: ${flag}`);
        return null;
    }
  }

  if (!email || !name || !password) {
    console.error(
      "❌ Missing required arguments. Use --help for usage information."
    );
    return null;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("❌ Invalid email address format.");
    return null;
  }

  return { email, name, password };
}

async function main() {
  console.log("🚀 Creating admin user...\n");

  const options = parseArgs();
  if (!options) {
    showHelp();
    process.exit(1);
  }

  await createAdmin(options);
}

// Run the script
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
