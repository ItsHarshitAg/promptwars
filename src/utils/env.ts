type EnvConfig = Record<string, string>;

/** Reads a config value from the runtime window.envConfig (injected by /config.js)
 *  falling back to Vite's import.meta.env for local development. */
export function getEnv(key: string): string {
  return (window as unknown as { envConfig?: EnvConfig }).envConfig?.[key]
    ?? (import.meta.env[key] as string | undefined)
    ?? '';
}
