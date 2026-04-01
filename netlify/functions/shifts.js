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
      const params = Object.fromEntries(url.searchParams);
      let query = `SELECT * FROM shifts`;
      const values = [];
      
      if (id) {
        query += ` WHERE id = $1`;
        values.push(id);
      } else if (params.venue_id) {
        query += ` WHERE venue_id = $1`;
        values.push(params.venue_id);
      } else if (params.status) {
        query += ` WHERE status = $1`;
        values.push(params.status);
      }
      
      query += ` ORDER BY shift_date DESC`;
      const rows = await sql(query, values);
      return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const user = await getUserFromAuth(req.headers.get("authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });

    if (method === "POST") {
      const body = await req.json();
      const { venue_id, role_type, shift_date, start_time, end_time, hourly_rate } = body;
      if (!venue_id || !role_type || !shift_date || !start_time || !end_time || !hourly_rate) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const [shift] = await sql(`INSERT INTO shifts (venue_id, role_type, shift_date, start_time, end_time, hourly_rate) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [venue_id, role_type, shift_date, start_time, end_time, hourly_rate]);
      return new Response(JSON.stringify(shift), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (method === "PATCH" && id) {
      const body = await req.json();
      const keys = Object.keys(body);
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const [updated] = await sql(`UPDATE shifts SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...Object.values(body)]);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "DELETE" && id) {
      await sql(`DELETE FROM shifts WHERE id = $1`, [id]);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Shifts error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { path: "/api/shifts" };
