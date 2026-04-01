import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const sql = neon();

function generateToken() { return crypto.randomBytes(48).toString("hex"); }
function hashToken(token) { return crypto.createHash("sha256").update(token).digest("hex"); }

async function getUserFromToken(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const rows = await sql(`SELECT u.* FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token_hash = $1 AND s.expires_at > NOW() LIMIT 1`, [hashToken(token)]);
  return rows[0] || null;
}

function userPublic(user) {
  const { password_hash, ppsn_encrypted, ...safe } = user;
  return safe;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const method = req.method;

  try {
    if (method === "GET" && action === "me") {
      const user = await getUserFromToken(req.headers.get("authorization"));
      if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify(userPublic(user)), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));

    if (method === "POST" && action === "register") {
      const { email, password, account_type, full_name } = body;
      if (!email || !password || !account_type) return new Response(JSON.stringify({ error: "Email, password and account type are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      if (password.length < 8) return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const existing = await sql(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email.toLowerCase()]);
      if (existing.length > 0) return new Response(JSON.stringify({ error: "That email is already registered — try signing in instead" }), { status: 409, headers: { "Content-Type": "application/json" } });
      const password_hash = await bcrypt.hash(password, 12);
      const [user] = await sql(`INSERT INTO users (email, password_hash, account_type, full_name) VALUES ($1,$2,$3,$4) RETURNING *`, [email.toLowerCase(), password_hash, account_type, full_name || null]);
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await sql(`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, [user.id, hashToken(token), expiresAt.toISOString()]);
      return new Response(JSON.stringify({ token, user: userPublic(user) }), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && action === "login") {
      const { email, password } = body;
      if (!email || !password) return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const rows = await sql(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email.toLowerCase()]);
      if (rows.length === 0) return new Response(JSON.stringify({ error: "No account found with that email — have you signed up?" }), { status: 401, headers: { "Content-Type": "application/json" } });
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return new Response(JSON.stringify({ error: "Incorrect password — try again or reset it below" }), { status: 401, headers: { "Content-Type": "application/json" } });
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await sql(`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, [user.id, hashToken(token), expiresAt.toISOString()]);
      return new Response(JSON.stringify({ token, user: userPublic(user) }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && action === "logout") {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) await sql(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(authHeader.slice(7))]);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && action === "update-profile") {
      const user = await getUserFromToken(req.headers.get("authorization"));
      if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
      const allowed = ["full_name","phone","date_of_birth","county","profile_photo_url","onboarding_completed","experience_years","skills","bio","availability","max_travel_km","id_verification_status","id_document_url","id_selfie_url"];
      const updates = {};
      for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }
      if (Object.keys(updates).length === 0) return new Response(JSON.stringify(userPublic(user)), { status: 200, headers: { "Content-Type": "application/json" } });
      const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(", ");
      const [updated] = await sql(`UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`, [user.id, ...Object.values(updates)]);
      return new Response(JSON.stringify(userPublic(updated)), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Auth error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { path: "/api/auth" };
