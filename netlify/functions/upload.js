import { getStore } from "@netlify/blobs";

async function getUserFromAuth(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  // For upload, we'll do a simpler auth check - in production you'd validate the token
  return { authenticated: true };
}

export default async function handler(req) {
  try {
    const user = await getUserFromAuth(req.headers.get("authorization"));
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });

    if (req.method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file");
      
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `uploads/${timestamp}-${random}-${file.name}`;

      // Store in Netlify Blobs
      const store = getStore("hospo-uploads");
      const buffer = await file.arrayBuffer();
      await store.set(filename, buffer, { metadata: { contentType: file.type } });

      // Return the blob URL
      const url = `/.netlify/blobs/hospo-uploads/${filename}`;
      return new Response(JSON.stringify({ url, filename }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { path: "/api/upload" };
