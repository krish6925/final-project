import api from "./axios";

// GET /api/goals -> goals owned by the signed-in user
export const fetchMyGoals = () => api.get("/goals");

// GET /api/goals/all-goals -> every goal, populated with employee + approver (manager/admin only)
export const fetchAllGoals = () => api.get("/goals/all-goals");

// GET /api/goals/:id
export const fetchGoalById = (id) => api.get(`/goals/${id}`);

// POST /api/goals -> Employee drafts a new goal
export const createGoalRequest = (payload) => api.post("/goals", payload);

// POST /api/goals/submit-sheet -> Employee submits final goal sheet (validates 100% total weightage)
export const submitGoalSheetRequest = () => api.post("/goals/submit-sheet");

// PUT /api/goals/:id -> Employee updates their own draft goal
export const updateGoalRequest = (id, payload) => api.put(`/goals/${id}`, payload);

// PUT /api/goals/:id/manager-update -> Manager inline edits target/weightage prior to approval
export const managerUpdateGoalRequest = (id, payload) => api.put(`/goals/${id}/manager-update`, payload);

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

// POST /api/goals/push-shared (manager/admin) -> Push departmental KPI across multiple employees
export const pushSharedGoalRequest = (payload) => api.post("/goals/push-shared", payload);

// PUT /api/goals/:id/checkin -> Update Phase 2 quarterly actuals and log manager discussion feedback
export const logCheckinRequest = (id, payload) => api.put(`/goals/${id}/checkin`, payload);

// GET /api/users/reports/export-achievement (admin only) -> Download CSV report blob
export const exportAchievementReportRequest = () =>
  api.get("/users/reports/export-achievement", {
    responseType: "blob"
  });