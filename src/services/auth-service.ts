import { hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import type { LoginInput, RegisterInput, User } from "@/models/user";

function mapUser(row: { id: number; name: string; email: string; createdAt: Date }): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt.toISOString()
  };
}

export async function initUsersTable() {
  // Prisma migrations manage schema; this keeps compatibility with existing call sites.
  await db.$queryRaw`SELECT 1`;
}

export async function createUser(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return null;

  const created = await db.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: hashPassword(input.password)
    }
  });

  return mapUser(created);
}

export async function loginUser(input: LoginInput) {
  const user = await db.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });
  if (!user) return null;

  const valid = verifyPassword(input.password, user.passwordHash);
  if (!valid) return null;

  return mapUser(user);
}

export async function getUserById(id: number) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return null;
  return mapUser(user);
}
