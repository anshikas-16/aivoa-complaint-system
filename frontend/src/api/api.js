const BASE_URL = "http://127.0.0.1:8000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  analyzeText: (text) =>
    fetch(`${BASE_URL}/api/ai/analyze-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(handle),

  analyzeFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE_URL}/api/ai/analyze-file`, {
      method: "POST",
      body: formData,
    }).then(handle);
  },

  createComplaint: (payload) =>
    fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  listComplaints: () => fetch(`${BASE_URL}/api/complaints`).then(handle),
};
