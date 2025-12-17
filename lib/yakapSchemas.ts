// lib/yakapSchemas.ts
import { z } from "zod";

// ─────────────────────────────
// LOGIN
// ─────────────────────────────

export const loginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const loginUserSchema = z.object({
  user_id: z.string(), // Prisma UUID
  username: z.string(),
  // ⬇️ allow string | null | undefined
  name: z.string().nullish(), // shorthand for string | null | undefined
  role: z.string(),
});

// Success / error union for response
export const loginSuccessSchema = z.object({
  ok: z.literal(true),
  user: loginUserSchema,
});

export const loginErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

export const loginResponseSchema = z.union([
  loginSuccessSchema,
  loginErrorSchema,
]);

// ─────────────────────────────
// YAKAP CORE + RELATIONS
// ─────────────────────────────

export const yakapCoreSchema = z.object({
  yakap_id: z.string(),
  fullname: z.string(),
  address: z.string().nullable(),
  brgy_id: z.string(),
  user_id: z.string(),
  createdAt: z.string(), // ISO strings
  updatedAt: z.string(),
});

// Optional relation: Province
export const provinceSchema = z.object({
  prov_id: z.string(),
  prov_name: z.string(),
});

// Optional relation: City
export const citySchema = z.object({
  city_id: z.string(),
  city_name: z.string(),
  province: provinceSchema.nullable().optional(),
});

// Optional relation: Brgy
export const brgyRowSchema = z.object({
  brgy_id: z.string(),
  brgy_name: z.string(),
  city: citySchema.nullable().optional(),
});

export const brgyListResponseSchema = z.object({
  ok: z.boolean(),
  data: z.array(brgyRowSchema),
});

// Yakap row including optional relations + encoder
export const yakapRowSchema = yakapCoreSchema.extend({
  brgy: brgyRowSchema.nullable().optional(),
  user: loginUserSchema.nullable().optional(),
});

// List response (success only – errors will be non-2xx)
export const yakapListResponseSchema = z.object({
  ok: z.literal(true),
  data: z.array(yakapRowSchema),
});

// Create Yakap request body
// ⬇️ user_id is NOT here – derived from session on the server
export const createYakapRequestSchema = z.object({
  fullname: z.string().min(1, "Fullname is required"),
  address: z.string().optional().nullable(),
  brgy_id: z.string().min(1, "Barangay is required"),
  user_id: z.string().min(1, "User is required"),
});

// Response for POST /api/yakap (success only)
export const createYakapResponseSchema = z.object({
  ok: z.literal(true),
  yakap: yakapCoreSchema, // create doesn't include relations by default
});

// ─────────────────────────────
// USER PUBLIC (for /auth/register, /auth/me)
// ─────────────────────────────

export const userPublicSchema = loginUserSchema.extend({
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- REGISTER ---
export const registerRequestSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string(),
  role: z.enum(["ENCODER", "ADMIN"]),
});

// ─────────────────────────────
// TYPES inferred from Zod
// ─────────────────────────────

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type LoginSuccessResponse = z.infer<typeof loginSuccessSchema>;

export type YakapCore = z.infer<typeof yakapCoreSchema>;
export type YakapRow = z.infer<typeof yakapRowSchema>;
export type YakapListResponse = z.infer<typeof yakapListResponseSchema>;

export type CreateYakapRequest = z.infer<typeof createYakapRequestSchema>;
export type CreateYakapResponse = z.infer<typeof createYakapResponseSchema>;

export type UserPublic = z.infer<typeof userPublicSchema>;
export type BrgyRow = z.infer<typeof brgyRowSchema>;
export type BrgyListResponse = z.infer<typeof brgyListResponseSchema>;
