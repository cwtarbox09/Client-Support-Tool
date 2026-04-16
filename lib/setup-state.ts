// Module-level store for the active device code flow.
// Single-server safe — setup only runs once and serially.

export interface SetupState {
  deviceCode: string
  tenantId: string
  interval: number   // seconds between poll attempts
  expiresAt: number  // ms epoch
}

let state: SetupState | null = null

export function setSetupState(s: SetupState): void {
  state = s
}

export function getSetupState(): SetupState | null {
  if (!state) return null
  if (Date.now() > state.expiresAt) {
    state = null
    return null
  }
  return state
}

export function clearSetupState(): void {
  state = null
}
