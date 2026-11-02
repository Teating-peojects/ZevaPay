import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { config } from "./config.js";

/**
 * Prisma client with the pg driver adapter, as required by Prisma 7.
 * A single instance is shared across the process.
 */
const adapter = new PrismaPg({ connectionString: config.databaseUrl });

export const prisma = new PrismaClient({
  adapter,
  log: config.env === "development" ? ["warn", "error"] : ["error"],
});

/**
 * Prisma 7's `Decimal` maps to a plain number for our money column because we
 * always store whole-taka amounts in this product.
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return Number(value ?? 0);
}
