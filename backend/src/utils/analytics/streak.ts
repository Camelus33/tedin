export function computeStreak(daysWithActivity: Set<string>): number {
  // daysWithActivity contains ISO date strings (YYYY-MM-DD)
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 400; i++) {
    const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
    const key = d.toISOString().slice(0, 10);
    if (daysWithActivity.has(key)) streak++;
    else break;
  }
  return streak;
}


