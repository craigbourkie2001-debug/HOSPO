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
      let query = `SELECT * FROM shift_applications`;
      const values = [];
      
      if (id) {
        query += ` WHERE id = $1`;
        values.push(id);
      } else if (params.worker_id) {
        query += ` WHERE worker_id = $1`;
        values.push(params.worker_id);
      } else if (params.shift_id) {
        query += ` WHERE shift_id = $1`;
        values.push(params.shift_id);
      } else if (params.status) {
        query += ` WHERE status = $1`;
        values.push(params.status);
      }
      
      query += ` ORDER BY created_at DESC`;
      const rows = await sql(query, values);
      return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const user = await getUserFromAuth(req.headers.get("authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });

    if (method === "POST") {
      const body = await req.json();
      const { shift_id, cover_note } = body;
      if (!shift_id) {
        return new Response(JSON.stringify({ error: "Shift ID is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const [app] = await sql(`INSERT INTO shift_applications (shift_id, worker_id, applicant_name, applicant_email, cover_note) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [shift_id, user.id, user.full_name, user.email, cover_note || null]);
      return new Response(JSON.stringify(app), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (method === "PATCH" && id) {
      const body = await req.json();
      const keys = Object.keys(body);
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const [updated] = await sql(`UPDATE shift_applications SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...Object.values(body)]);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "DELETE" && id) {
      await sql(`DELETE FROM shift_applications WHERE id = $1`, [id]);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Applications error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { path: "/api/applications" };
