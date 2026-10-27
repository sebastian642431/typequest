export const WORLD_COLORS: Record<string, { background: string; border: string }> = {
  basics: { background: "#2c6bc0", border: "#1d4f95" },
  intermediate: { background: "#0e8f7e", border: "#08695c" },
  advanced: { background: "#7a4fd0", border: "#5a35a3" },
  hacker: { background: "#d13f72", border: "#9c2752" },
  "real-world": { background: "#e0731c", border: "#a85210" },
};

export function worldColor(id: string) {
  return WORLD_COLORS[id] ?? WORLD_COLORS.basics;
}
