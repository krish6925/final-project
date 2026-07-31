import api from "./axios";

// POST /api/users -> { _id, name, email, role, isApproved, token }
export const registerRequest = (payload) => api.post("/users", payload);

// POST /api/users/login -> { _id, name, email, role, isApproved, token }
export const loginRequest = (payload) => api.post("/users/login", payload);

// 👈 MAKE SURE THIS IS EXPORTED EXACTLY AS 'fetchProfile'
export const fetchProfile = () => api.get("/users/profile");

// Admin approval requests
export const fetchPendingUsers = () => api.get("/users/pending-approvals");
export const approveUserRequest = (id) => api.put(`/users/${id}/approve`);
export const rejectUserRequest = (id) => api.delete(`/users/${id}/reject`);