import ApiClient from './ApiClient';
import EnvironmentManager from './EnvironmentManager';
import LocalStorageManager from './LocalStorageManager';

class DataManager {
  private static instance: DataManager | null = null;
  private apiClient: ApiClient;
  private localStorageManager: LocalStorageManager;
  private firebaseKey: string; 

  private constructor(apiClient: ApiClient, localStorageManager: LocalStorageManager) {
    this.apiClient = apiClient;
    this.localStorageManager = localStorageManager;
    this.firebaseKey = EnvironmentManager.getFirebaseKey();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      const apiClient = ApiClient.getInstance();
      const localStorageManager = LocalStorageManager.getInstance();
      DataManager.instance = new DataManager(apiClient, localStorageManager);
    }
    return DataManager.instance;
  }

  syncData(): Promise<boolean> {
    const idToken = this.localStorageManager.getIdToken();
    const nextSyncToken = this.localStorageManager.getNextSyncToken();
    const familyKey = this.localStorageManager.getFamilyKey();
    return new Promise<boolean>((resolve, reject) => {
      this.apiClient.refreshSession().then((refreshed) => {
        console.log(`Session ${refreshed ? 'refreshed' : 'still active'}`)
        this.apiClient
          .getStats(idToken, this.firebaseKey, familyKey, nextSyncToken)
          .then((statsResponse) => {
            if (!statsResponse) {
              throw new Error("Failed to retrieve stats");
            }

            // Merge new stats with old stats
            console.log('STATS RETRIEVED', statsResponse.result);
            const currentTrackz = this.localStorageManager.getTrackz();
            const newTrackz = {...currentTrackz, ...statsResponse.result.trackz}
            this.localStorageManager.setNextSyncToken(statsResponse.result.nextSyncKey);
            this.localStorageManager.setTrackz(newTrackz);
            resolve(true);
          })
          .catch((error) => {
            console.error('Error occurred during token refresh:', error);
            resolve(false);
          });
      });
    });
  }

  getEventsByType<T extends EventType>(events: ApiEvent[], eventType: T): EventTypeToEventMap[T][] {
    return events.filter((event) => {
      return event.type === eventType;
    }) as EventTypeToEventMap[T][];
  }

  getTodaysEventsByType<T extends EventType>(events: ApiEvent[], eventType: T): EventTypeToEventMap[T][] {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
    return events.filter((event) => {
      const eventDate = new Date(event.beginDt);
      return eventDate >= startOfDay && event.type === eventType;
    }) as EventTypeToEventMap[T][];
  }

  getFirstEventByType<T extends EventType>(events: ApiEvent[], eventType: T):  EventTypeToEventMap[T] {
    return events.reduce(function (prev, curr) {
      return curr.type === eventType && prev.beginDt > curr.beginDt ? curr : prev;
    }) as EventTypeToEventMap[T];
  }

  getLastEventByType<T extends EventType>(events: ApiEvent[], eventType: T):  EventTypeToEventMap[T] {
    return events.reduce(function (prev, curr) {
      return curr.type === eventType && prev.beginDt < curr.beginDt ? curr : prev;
    }) as EventTypeToEventMap[T];
  }

  formatTime(datenum: number): string {
    return new Date(datenum).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  getStatus(beginDt: number): 'OKAY' | 'LATE' | 'OVERDUE' {
    const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
    const TWO_HOURS = 2 * ONE_HOUR; // 2 hours in milliseconds

    // Get the current time in milliseconds
    const currentTime = Date.now();

    // Calculate the difference between the current time and beginDt
    const timeDifference = currentTime - beginDt;

    // Check if the event occurred within the past 1 hour
    if (timeDifference <= ONE_HOUR) {
        return 'OKAY';
    }

    // Check if the event occurred within the past 2 hours
    if (timeDifference <= TWO_HOURS) {
        return 'LATE';
    }

    // Otherwise, the event is overdue
    return 'OVERDUE';
}

}

export default DataManager;
