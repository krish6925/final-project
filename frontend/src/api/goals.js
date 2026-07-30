import api from "./axios";

// GET /api/goals -> goals owned by the signed-in user
export const fetchMyGoals = () => api.get("/goals");

// GET /api/goals/all-goals -> every goal, populated with employee + approver (manager/admin only)
export const fetchAllGoals = () => api.get("/goals/all-goals");

// GET /api/goals/:id
export const fetchGoalById = (id) => api.get(`/goals/${id}`);

// POST /api/goals
export const createGoalRequest = (payload) => api.post("/goals", payload);

// PUT /api/goals/:id
export const updateGoalRequest = (id, payload) => api.put(`/goals/${id}`, payload);

// DELETE /api/goals/:id
export const deleteGoalRequest = (id) => api.delete(`/goals/${id}`);

// PUT /api/goals/:id/approve (manager/admin)
export const approveGoalRequest = (id) => api.put(`/goals/${id}/approve`);

// PUT /api/goals/:id/reject (manager/admin)
export const rejectGoalRequest = (id) => api.put(`/goals/${id}/reject`);

// PUT /api/goals/:id/rework (manager/admin)
export const reworkGoalRequest = (id) => api.put(`/goals/${id}/rework`);

// PUT /api/goals/:id/lock (admin only)
export const lockGoalRequest = (id) => api.put(`/goals/${id}/lock`);
