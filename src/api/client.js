function getToken() { return localStorage.getItem("hospo_token"); }
function setToken(t) { localStorage.setItem("hospo_token", t); }
function clearToken() { localStorage.removeItem("hospo_token"); }

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(data.error || `Request failed: ${res.status}`); err.status = res.status; err.code = data.code; throw err; }
  return data;
}

export const auth = {
  async register(email, password, account_type, full_name) { const data = await request("/api/auth?action=register", { method: "POST", body: JSON.stringify({ email, password, account_type, full_name }) }); setToken(data.token); return data.user; },
  async login(email, password) { const data = await request("/api/auth?action=login", { method: "POST", body: JSON.stringify({ email, password }) }); setToken(data.token); return data.user; },
  async logout() { try { await request("/api/auth?action=logout", { method: "POST" }); } catch (_) {} clearToken(); },
  async me() { return request("/api/auth?action=me"); },
  async updateProfile(updates) { return request("/api/auth?action=update-profile", { method: "POST", body: JSON.stringify(updates) }); },
  redirectToLogin() { window.location.href = "/Welcome"; },
};

export const shifts = {
  async list(params = {}) { const p = new URLSearchParams(); Object.entries(params).forEach(([k,v]) => v && p.set(k,v)); return request(`/api/shifts?${p}`); },
  async create(data) { return request("/api/shifts", { method: "POST", body: JSON.stringify(data) }); },
  async update(id, data) { return request(`/api/shifts?id=${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  async delete(id) { return request(`/api/shifts?id=${id}`, { method: "DELETE" }); },
  filter(params) { return this.list(params); },
};

export const applications = {
  async list(params = {}) { const p = new URLSearchParams(); Object.entries(params).forEach(([k,v]) => v && p.set(k,v)); return request(`/api/applications?${p}`); },
  async apply(shift_id, cover_note) { return request("/api/applications", { method: "POST", body: JSON.stringify({ shift_id, cover_note }) }); },
  async updateStatus(id, status) { return request(`/api/applications?id=${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); },
  filter(params) { return this.list(params); },
};

export const venues = {
  async listMine() { return request("/api/venues?mine=1"); },
  async get(id) { return request(`/api/venues?id=${id}`); },
  async create(data) { return request("/api/venues", { method: "POST", body: JSON.stringify(data) }); },
  async update(id, data) { return request(`/api/venues?id=${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  filter(params = {}) { if (params.owner_id) return this.listMine(); return request("/api/venues"); },
};

export const jobs = {
  async list(params = {}) { const p = new URLSearchParams(); Object.entries(params).forEach(([k,v]) => v && p.set(k,v)); return request(`/api/jobs?${p}`); },
  async create(data) { return request("/api/jobs", { method: "POST", body: JSON.stringify(data) }); },
  async update(id, data) { return request(`/api/jobs?id=${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  filter(params) { return this.list(params); },
};

export const messages = {
  async list() { return request("/api/messages"); },
  async send(recipient_id, content) { return request("/api/messages", { method: "POST", body: JSON.stringify({ recipient_id, content }) }); },
};

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const token = getToken();
  const res = await fetch("/api/upload", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

export const base44 = {
  auth,
  entities: {
    Shift: { filter: shifts.filter.bind(shifts), create: shifts.create.bind(shifts), update: shifts.update.bind(shifts), delete: shifts.delete.bind(shifts) },
    ShiftApplication: { filter: applications.filter.bind(applications), create: (d) => applications.apply(d.shift_id, d.cover_note), update: applications.updateStatus.bind(applications) },
    Job: { filter: jobs.filter.bind(jobs), create: jobs.create.bind(jobs), update: jobs.update.bind(jobs) },
    JobApplication: { filter: (p) => request(`/api/job-applications?${new URLSearchParams(p)}`), create: (d) => request("/api/job-applications", { method: "POST", body: JSON.stringify(d) }), update: (id, d) => request(`/api/job-applications?id=${id}`, { method: "PATCH", body: JSON.stringify(d) }) },
    CoffeeShop: { filter: venues.filter.bind(venues), create: venues.create.bind(venues), update: (id, d) => venues.update(id, d) },
    Restaurant: { filter: venues.filter.bind(venues), create: venues.create.bind(venues), update: (id, d) => venues.update(id, d) },
    Message: { filter: () => messages.list(), create: (d) => messages.send(d.recipient_id, d.content) },
    User: { filter: (p) => request(`/api/users?${new URLSearchParams(p)}`), update: (id, d) => request(`/api/users?id=${id}`, { method: "PATCH", body: JSON.stringify(d) }) },
  },
  integrations: {
    Core: {
      SendEmail: (d) => request("/api/email", { method: "POST", body: JSON.stringify(d) }),
      UploadFile: ({ file }) => uploadFile(file),
    }
  },
};

export default base44;
