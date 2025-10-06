import { config } from "dotenv";
import { resolve } from "path";

// Load test environment variables
config({ path: resolve(process.cwd(), ".env.test") });

// Ensure we're in test environment
process.env.NODE_ENV = "test";
