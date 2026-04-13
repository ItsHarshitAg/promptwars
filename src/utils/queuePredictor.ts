/**
 * Predicts queue wait times and calculates density based on raw zone data.
 * @param current - current occupancy
 * @param capacity - maximum occupancy
 * @returns An object containing density (0-1) and expected waitMinutes.
 */
export function calculateQueueWaitTime(
  current: number,
  capacity: number
): { density: number; waitMinutes: number } {
  if (capacity <= 0) return { density: 0, waitMinutes: 0 };
  
  const density = Math.max(0, Math.min(1, current / capacity));
  
  let waitMinutes = 0;
  if (density >= 0.9) {
    waitMinutes = 30 + Math.floor((density - 0.9) * 100);
  } else if (density >= 0.8) {
    waitMinutes = 20 + Math.floor((density - 0.8) * 100);
  } else if (density >= 0.5) {
    waitMinutes = 10 + Math.floor((density - 0.5) * 33);
  } else if (density >= 0.2) {
    waitMinutes = 2 + Math.floor((density - 0.2) * 26);
  }
  
  return { density, waitMinutes };
}
