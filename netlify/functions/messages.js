import { neon } from "@netlify/neon";

const sql = neon();

async function getUserFromAuth(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const rows = await sql(`SELECT u.* FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token_hash = $1 AND s.expires_at > NOW() LIMIT 1`, [require('crypto').createHash("sha256").update(token).digest("hex")]);
  return rows[0] || null;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const method = req.method;

  try {
    const user = await getUserFromAuth(req.headers.get("authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });

    if (method === "GET") {
      const rows = await sql(`SELECT * FROM messages WHERE recipient_id = $1 OR sender_id = $1 ORDER BY created_at DESC`, [user.id]);
      return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST") {
      const body = await req.json();
      const { recipient_id, content } = body;
      if (!recipient_id || !content) {
        return new Response(JSON.stringify({ error: "recipient_id and content are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      
      const [recipient] = await sql(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [recipient_id]);
      if (!recipient) {
        return new Response(JSON.stringify({ error: "Recipient not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      
      const [message] = await sql(`INSERT INTO messages (sender_id, recipient_id, sender_name, sender_email, recipient_name, recipient_email, content) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [user.id, recipient_id, user.full_name, user.email, recipient.full_name, recipient.email, content]);
      return new Response(JSON.stringify(message), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Messages error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { path: "/api/messages" };
