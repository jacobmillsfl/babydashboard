class LocalStorageManager {
  private static instance: LocalStorageManager | null = null;

  private constructor() {}

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  // Getters
  getTrackz(): Record<string, ApiEvent> {
    const trackzJson = localStorage.getItem('trackz');
    return trackzJson ? JSON.parse(trackzJson) : {};
  }

  getIdToken(): string {
    return localStorage.getItem('idToken') || '';
  }

  getRefreshToken(): string {
    return localStorage.getItem('refreshToken') || '';
  }

  getNextSyncToken(): string {
    return localStorage.getItem('nextSyncToken') || '';
  }

  getTokenExpiration(): number {
    const expiration = localStorage.getItem('tokenExpiration');
    return expiration ? parseInt(expiration) : 0;
  }

  getFamilyKey(): string {
    return localStorage.getItem('familyKey') || '';
  }

  getLastWsSession(): string {
    return localStorage.getItem('webSocketSession') || '';
  }

  // Setters
  setTrackz(trackz: Record<string, any>): void {
    localStorage.setItem('trackz', JSON.stringify(trackz));
  }

  setIdToken(idToken: string): void {
    localStorage.setItem('idToken', idToken);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
  }

  setNextSyncToken(nextSyncToken: string): void {
    localStorage.setItem('nextSyncToken', nextSyncToken);
  }

  setTokenExpiration(tokenExpiration: number): void {
    localStorage.setItem('tokenExpiration', tokenExpiration.toString());
  }

  setFamilyKey(key: string): void {
    localStorage.setItem('familyKey', key);
  }

  setLastWsSession(session: string) {
    localStorage.setItem('webSocketSession', session);
  }

  // Clear all stored data
  clearLocalStorage(): void {
    localStorage.clear();
  }
}

export default LocalStorageManager;
