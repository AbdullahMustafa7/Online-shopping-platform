export function requireEnv(name: string): string {
  const v = process.env[name];
  // For this project, we prefer not to crash on missing envs.
  // Callers should handle the empty-string case appropriately.
  return v ?? "";
}

