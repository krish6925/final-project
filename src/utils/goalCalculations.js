/**
 * Calculates the progress percentage score based on Unit of Measurement (UoM)
 * 
 * Rules:
 * - Min (Numeric / %): Higher is better -> Actual / Target
 * - Max (Numeric / %): Lower is better -> Target / Actual
 * - Timeline: Completion date vs Deadline -> If Date <= Target -> 100%, else 0%
 * - Zero: Zero = Success (e.g., Safety incidents) -> If 0 -> 100%, else 0%
 * 
 * @param {Object} params
 * @param {string} params.uom - "Numeric", "%", "Timeline", "Zero", or "Zero-based"
 * @param {string} [params.type="Min"] - "Min" (Higher is better) or "Max" (Lower is better)
 * @param {number|string} params.target - Planned target
 * @param {number|string} params.actual - Actual achievement logged
 * @returns {number} Calculated progress percentage score
 */
export function computeProgressScore({ uom, type = "Min", target, actual }) {
  if (actual === "" || actual === null || actual === undefined) return 0;

  const cleanUom = String(uom).trim().toLowerCase();

  // 1. Zero-based UoM
  if (cleanUom === "zero" || cleanUom === "zero-based") {
    const numActual = Number(actual);
    return !isNaN(numActual) && numActual === 0 ? 100 : 0;
  }

  // 2. Timeline UoM
  if (cleanUom === "timeline") {
    if (!target || !actual) return 0;
    const actualDate = new Date(actual);
    const targetDate = new Date(target);

    if (isNaN(actualDate.getTime()) || isNaN(targetDate.getTime())) return 0;
    return actualDate <= targetDate ? 100 : 0;
  }

  // 3. Numeric / % (Min or Max)
  const numTarget = Number(target);
  const numActual = Number(actual);

  if (isNaN(numTarget) || isNaN(numActual) || numTarget <= 0) return 0;

  // Max: Lower is better (Target ÷ Achievement)
  if (type === "Max" || cleanUom.includes("max")) {
    if (numActual <= 0) return 0;
    return Math.round((numTarget / numActual) * 100);
  }

  // Min: Higher is better (Achievement ÷ Target)
  return Math.round((numActual / numTarget) * 100);
}

/**
 * Validates whether a list of goals complies with Phase 1 constraints:
 * 1. Maximum of 8 goals total per employee.
 * 2. Minimum weightage per individual goal is 10%.
 * 3. Total weightage across all goals must equal 100%.
 * 
 * @param {Array} goals - Array of goal objects with `weightage` property
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export function validateGoalSheet(goals = []) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return { isValid: false, error: "Your goal sheet must have at least one goal." };
  }

  if (goals.length > 8) {
    return { isValid: false, error: "Maximum limit reached: An employee sheet cannot exceed 8 goals." };
  }

  let totalWeight = 0;

  for (let i = 0; i < goals.length; i++) {
    const w = Number(goals[i].weightage);

    if (isNaN(w) || w < 10) {
      return {
        isValid: false,
        error: `Goal ${i + 1} ("${goals[i].title || "Untitled"}") has a weightage below the required minimum of 10%.`
      };
    }

    totalWeight += w;
  }

  // Use Math.abs threshold to avoid floating-point rounding issues (e.g. 99.99999999)
  if (Math.abs(totalWeight - 100) > 0.01) {
    return {
      isValid: false,
      error: `Total weightage across all goals must equal 100%. Current total is ${Number(totalWeight.toFixed(2))}%.`
    };
  }

  return { isValid: true, error: null };
}