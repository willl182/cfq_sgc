import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Función simple para hash de contraseña (en producción usar bcrypt o similar)
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(16);
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Helper para validar token y retornar usuario
export async function getUserFromToken(ctx: any, token: string | undefined) {
  if (!token) return null;
  const userId = token.split("_")[0];
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user || !user.isActive) return null;
  return user;
}

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  }),
  handler: async (ctx, { name, email, password, role }) => {
    // Verificar si ya existe un usuario con ese email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      return { success: false, error: "Ya existe un usuario con ese email" };
    }

    const passwordHash = hashPassword(password);
    const userId = await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      role: role ?? "user",
      isActive: true,
      createdAt: Date.now(),
    });

    return { success: true, userId };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    token: v.optional(v.string()),
    user: v.optional(
      v.object({
        _id: v.id("users"),
        name: v.string(),
        email: v.string(),
        role: v.string(),
      })
    ),
  }),
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (!user.isActive) {
      return { success: false, error: "Usuario inactivo" };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: "Contraseña incorrecta" };
    }

    // Actualizar último login
    await ctx.db.patch(user._id, { lastLoginAt: Date.now() });

    // Generar token simple (en producción usar JWT)
    const token = `${user._id}_${Date.now()}`;

    return {
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
});

export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      name: v.string(),
      email: v.string(),
      role: v.string(),
    })
  ),
  handler: async (ctx, { token }) => {
    if (!token) return null;

    const userId = token.split("_")[0];
    if (!userId) return null;

    const user = await ctx.db.get(userId as any) as any;
    if (!user || !user.isActive) return null;

    return {
      _id: user._id as any,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});

export const listUsers = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      email: v.string(),
      role: v.string(),
      isActive: v.boolean(),
      createdAt: v.number(),
      lastLoginAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, { includeInactive }) => {
    let users = await ctx.db.query("users").collect();

    if (!includeInactive) {
      users = users.filter((u) => u.isActive);
    }

    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
      isActive: v.optional(v.boolean()),
    }),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { userId, updates }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { userId, currentPassword, newPassword }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return { success: false, error: "Contraseña actual incorrecta" };
    }

    const newHash = hashPassword(newPassword);
    await ctx.db.patch(userId, { passwordHash: newHash });
    return { success: true };
  },
});
