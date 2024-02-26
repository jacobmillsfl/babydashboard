import WebSocketManager from '../Components/WebSocketManager';
import LocalStorageManager from './LocalStorageManager';
import EnvironmentManager from './EnvironmentManager';

class ApiClient {
    private static instance: ApiClient | null = null;

    private readonly apiKey: string;

    private constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            const key = EnvironmentManager.getApiKey();
            ApiClient.instance = new ApiClient(key);
        }
        return ApiClient.instance;
    }

    public async refreshIdToken(refreshToken: string): Promise<RefreshTokenResponse> {
        const url = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;

        const requestData: RefreshTokenRequest = {
            grantType: 'refresh_token',
            refreshToken: refreshToken
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        };

        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`Error during token refresh: ${msg}`);
        }

        const responseData: RefreshTokenResponse = await response.json();
        return responseData;
    }

    public async verifyPassword(email: string, password: string): Promise<VerifyPasswordResponse> {
        const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${this.apiKey}`;

        const requestData: VerifyPasswordRequest = {
            email: email,
            password: password,
            returnSecureToken: true
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        };

        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`Error: Invalid credentials`);
        }

        const responseData: VerifyPasswordResponse = await response.json();
        return responseData;
    }

    public async getStats(bearerToken: string, firebaseToken: string, familyKey: string, prevSyncKey?: string): Promise<DataObject> {
        const url = 'https://us-central1-amazing-ripple-221320.cloudfunctions.net/app';
        let requestData = {
            data: {
                action: '/family/trackz/sync2',
                familyKey: familyKey,
            }
        };
        let requestDataSync = {
            data: {
                action: '/family/trackz/sync2',
                familyKey: familyKey,
                prevSyncKey: prevSyncKey,
            }
        };

        let requestBody = prevSyncKey ? requestData : requestDataSync;

        console.log("Request data", requestData)

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${bearerToken}`);
        headers.append('Firebase-Instance-ID-Token', firebaseToken);
        headers.append('Content-Type', 'application/json; charset=utf-8');

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        };

        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`Error: ${msg}`);
        }

        const responseData = await response.json();
        const result: Result = responseData.result;

        // Parse and validate trackz events
        const trackz: Trackz = {};
        for (const eventId in result.trackz) {
            const event = result.trackz[eventId];
            switch (event.type) {
                case 'FEED':
                    if (event.feedType === 'BREAST') {
                        trackz[eventId] = event as BreastEvent;
                    } else if (event.feedType === 'BOTTLE') {
                        trackz[eventId] = event as BottleEvent;
                    } else {
                        console.warn(`unsupported feed type for event: ${event}`);
                    }
                    break;
                case 'PUMP':
                    trackz[eventId] = event as PumpEvent;
                    break;
                case 'ROUTINE':
                    trackz[eventId] = event as RoutineEvent;
                    break;
                case 'DIAPER':
                    trackz[eventId] = event as DiaperEvent;
                    break;
                case 'SLEEP':
                    trackz[eventId] = event as SleepEvent;
                    break;
                default:
                    console.warn(`Unsupported event type for event: ${event}`);
                    break;
            }
        }

        return { result: { nextSyncKey: result.nextSyncKey, trackz: trackz } };
    }

    getFamilyKey = async (authToken: string) => {
        const baseUrl = "s-usc1a-nss-2056.firebaseio.com";
        // 1) Connect
        const websock = new WebSocketManager();
        websock.connect(baseUrl);
        await websock.waitForMessages();
        let msgResponse = websock.getNextMessage();
        let {
            d: {
                d: { ts, v, h, s }
            }
        } = msgResponse;

        if (!s) {
            console.log("WS Session Failed, reattempting with new URI")
            // Session failed, reattempt
            const {
                d: {
                    d, t
                }
            } = msgResponse;
            const newUri = d;
            websock.flushMessages();
            websock.close();
            websock.connect(newUri);

            await websock.waitForMessages();
            let msgResponse2 = websock.getNextMessage();
            let {
                d: {
                    d: { ts, v, h, s }
                }
            } = msgResponse2;
            console.log('Handshake Timestamp:', ts);
            console.log('Protocol Version:', v);
            console.log('Hostname:', h);
            console.log('Session Identifier:', s);
        } else {
            console.log('Handshake Timestamp:', ts);
            console.log('Protocol Version:', v);
            console.log('Hostname:', h);
            console.log('Session Identifier:', s);
        }

        websock.flushMessages();

        // 2) Auth
        websock.auth(authToken);
        await websock.waitForMessages();
        const authResult = websock.getNextMessage();
        const parsedData: AuthorizationResult = authResult.d;
        const userId = parsedData.b.d.auth.user_id;
        console.log('User ID', userId);
        websock.flushMessages();

        // 3) Get family key
        websock.getFamilyKeyz(userId);
        await websock.waitForMessages();
        const familyKeyz = websock.getNextMessage();
        const {
            d: {
                b: { d }
            }
        } = familyKeyz;
        const key = Object.keys(d)[0];
        console.log('Setting family key', key);

        // 4) Cleanup socket
        websock.flushMessages();
        websock.close();

        return key;
    };

    refreshSession = async (): Promise<boolean> => {
        const localStorageManager = LocalStorageManager.getInstance();
        return new Promise((resolve, reject) => {
            if (localStorageManager.getTokenExpiration() <= Date.now()) {
                this.refreshIdToken(localStorageManager.getRefreshToken())
                    .then((result) => {
                        const { id_token, refresh_token, expires_in } = result;
                        const expiresInSeconds = parseInt(expires_in);
                        const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;

                        localStorageManager.setIdToken(id_token);
                        localStorageManager.setRefreshToken(refresh_token);
                        localStorageManager.setTokenExpiration(expirationTime);

                        resolve(true); // New token set
                    })
                    .catch((reason) => {
                        reject(reason);
                    });
            } else {
                resolve(false); // Current token not expired
            }
        });
    };
}

export default ApiClient;
