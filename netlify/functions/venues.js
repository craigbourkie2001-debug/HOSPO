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
  const id = url.searchParams.get("id");

  try {
    if (method === "GET") {
      const mine = url.searchParams.get("mine");
      const user = mine ? await getUserFromAuth(req.headers.get("authorization")) : null;
      
      let query = `SELECT * FROM venues`;
      const values = [];
      
      if (id) {
        query += ` WHERE id = $1`;
        values.push(id);
      } else if (mine && user) {
        query += ` WHERE owner_id = $1`;
        values.push(user.id);
      }
      
      query += ` ORDER BY created_at DESC`;
      const rows = await sql(query, values);
      return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const user = await getUserFromAuth(req.headers.get("authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });

    if (method === "POST") {
      const body = await req.json();
      const { name, venue_type, address, town, county } = body;
      if (!name || !venue_type) {
        return new Response(JSON.stringify({ error: "Name and venue_type are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const [venue] = await sql(`INSERT INTO venues (owner_id, name, venue_type, address, town, county) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [user.id, name, venue_type, address, town, county]);
      return new Response(JSON.stringify(venue), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (method === "PATCH" && id) {
      const body = await req.json();
      const keys = Object.keys(body);
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const [updated] = await sql(`UPDATE venues SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...Object.values(body)]);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Venues error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { path: "/api/venues" };
