export function dateRange(startStr: string, endStr: string): string[] {
  const days: string[] = [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  const cur = new Date(start);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function hiddenGemsLabel(slider: number): string {
  if (slider <= 20) return "almost entirely tourist classics and well-known landmarks";
  if (slider <= 40) return "mostly popular spots with a few local finds";
  if (slider <= 60) return "a balanced mix of tourist highlights and hidden gems";
  if (slider <= 80) return "mostly hidden gems and local favorites";
  return "almost entirely hidden gems, off-the-beaten-path spots locals love";
}
