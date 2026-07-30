import api from "./axios";

// POST /api/users  -> { _id, name, email, role, token }
export const registerRequest = (payload) => api.post("/users", payload);

// POST /api/users/login -> { _id, name, email, role, token }
export const loginRequest = (payload) => api.post("/users/login", payload);

// GET /api/users/profile -> user (no password)
export const fetchProfile = () => api.get("/users/profile");
