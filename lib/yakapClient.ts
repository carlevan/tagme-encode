// lib/yakapClient.ts
import {
  loginRequestSchema,
  loginResponseSchema,
  yakapListResponseSchema,
  createYakapRequestSchema,
  createYakapResponseSchema,
  registerRequestSchema,
  userPublicSchema,
  brgyListResponseSchema,
  type RegisterRequest,
  type UserPublic,
  type LoginRequest,
  type LoginUser,
  type YakapRow,
  type CreateYakapRequest,
  type BrgyRow,
} from "./yakapSchemas";

// ─────────────────────────────
// LOGIN
// ─────────────────────────────

export async function loginUser(input: LoginRequest): Promise<LoginUser> {
  const body = loginRequestSchema.parse(input);

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  const parsed = loginResponseSchema.parse(json);

  if (!parsed.ok) {
    throw new Error(parsed.error || "Login failed");
  }

  return parsed.user;
}

// Get current user from cookie-based session
export async function getCurrentUser(): Promise<LoginUser> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    // important for cookies in fetch from client
    credentials: "include",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json?.ok === false) {
    const msg = json?.error || `Not authenticated (${res.status})`;
    throw new Error(msg);
  }

  const user = userPublicSchema.parse(json.user);
  return user;
}

// ─────────────────────────────
// BRGY
// ─────────────────────────────

export async function getBrgies(): Promise<BrgyRow[]> {
  const res = await fetch("/api/brgy", { cache: "no-store" });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.error || `Failed to load barangays (${res.status})`;
    throw new Error(msg);
  }

  const parsed = brgyListResponseSchema.parse(json);
  return parsed.data;
}

// ─────────────────────────────
// YAKAP
// ─────────────────────────────

// GET /api/yakap – returns TODAY’s yakaps for current user (by cookie)
export async function getYakaps() {
  const res = await fetch("/api/yakap");

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(
      (json && json.error) || `Failed to load Yakap list (${res.status})`,
    );
  }

  const parsed = yakapListResponseSchema.parse(await res.json());

  // ✅ RETURN ONLY THE ARRAY
  return parsed.data;
}


export async function createYakap(
  input: CreateYakapRequest,
): Promise<YakapRow> {
  // NOTE: user_id is now derived from session on server – we don't send it.
  const body = createYakapRequestSchema.parse(input);

  const res = await fetch("/api/yakap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (json && json.error) || `Failed to create Yakap (${res.status})`;
    throw new Error(msg);
  }

  const parsed = createYakapResponseSchema.parse(json);

  const core = parsed.yakap;

  const row: YakapRow = {
    ...core,
    brgy: null,
    user: null,
  };

  return row;
}

// ─────────────────────────────
// REGISTER
// ─────────────────────────────

export async function registerUser(input: RegisterRequest): Promise<UserPublic> {
  const parsed = registerRequestSchema.parse(input);

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(parsed),
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || json?.ok === false) {
    const msg =
      json?.error || json?.message || `Register failed (${res.status})`;
    throw new Error(msg);
  }

  const user = userPublicSchema.parse(json.user);
  return user;
}
