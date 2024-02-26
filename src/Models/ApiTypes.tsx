type BreastEvent = {
    beginDt: number;
    childKey: string;
    createUserKey: string;
    etag: string;
    feedType: 'BREAST';
    ord: number;
    serverUpdateDt: number;
    type: 'FEED';
    tz: string;
    updateDt: number;
    userKey: string;
    breastBeginSide: 'LEFT' | 'RIGHT';
    breastLeftDuration?: number;
    breastRightDuration?: number;
};

type PumpEvent = {
    beginDt: number;
    breastLeftDuration?: number;
    breastRightDuration?: number;
    childKey: string;
    createUserKey: string;
    endDt: number;
    etag: string;
    ord: number;
    serverUpdateDt: number;
    type: 'PUMP';
    tz: string;
    updateDt: number;
    userKey: string;
};

type BottleEvent = {
    beginDt: number;
    bottleBreastMilkVolumeExp?: number;
    bottleBreastMilkVolumeNum?: number;
    bottleBreastMilkVolumeUnit?: string;
    bottleTypeBreastMilk?: boolean;
    bottleTypeFormula?: boolean;
    bottleVolume?: number;
    bottleVolumeBase?: number;
    bottleVolumeExp?: number;
    bottleVolumeNum?: number;
    bottleVolumeUnit?: string;
    childKey: string;
    createUserKey: string;
    etag: string;
    feedType: 'BOTTLE';
    ord: number;
    serverUpdateDt: number;
    type: 'FEED';
    tz: string;
    updateDt: number;
    userKey: string;
};

type RoutineEvent = {
    beginDt: number;
    childKey: string;
    createUserKey: string;
    etag: string;
    note: string;
    ord: number;
    routineName: string;
    serverUpdateDt: number;
    type: 'ROUTINE';
    tz: string;
    updateDt: number;
    userKey: string;
};

type DiaperEvent = {
    beginDt: number;
    childKey: string;
    createUserKey: string;
    diaperTypeDry?: boolean;
    diaperTypePee?: boolean;
    diaperTypePoop?: boolean;
    diaperTypeRash?: boolean;
    etag: string;
    ord: number;
    serverUpdateDt: number;
    type: 'DIAPER';
    tz: string;
    updateDt: number;
    userKey: string;
};

type SleepEvent = {
    endDt?: number;
    beginDt: number;
    childKey: string;
    createUserKey: string;
    etag: string;
    ord: number;
    serverUpdateDt: number;
    type: 'SLEEP';
    tz: string;
    updateDt: number;
    userKey: string;
};

type EventType = 'FEED' | 'SLEEP' | 'ROUTINE' | 'DIAPER' | 'PUMP';

type ApiEvent = BreastEvent | PumpEvent | BottleEvent | RoutineEvent | DiaperEvent | SleepEvent;

type FeedEvent = BreastEvent | BottleEvent;

type EventTypeToEventMap = {
    FEED: FeedEvent;
    SLEEP: SleepEvent;
    ROUTINE: RoutineEvent;
    DIAPER: DiaperEvent;
    PUMP: PumpEvent;
};

type Trackz = Record<string, ApiEvent>;

type Result = {
    nextSyncKey: string;
    trackz: Trackz;
};

type DataObject = {
    result: Result;
};

type VerifyPasswordRequest = {
    email: string;
    password: string;
    returnSecureToken: boolean;
};

type VerifyPasswordResponse = {
    kind: string;
    localId: string;
    email: string;
    displayName: string;
    idToken: string;
    registered: boolean;
    refreshToken: string;
    expiresIn: string;
};

type RefreshTokenRequest = {
    grantType: 'refresh_token';
    refreshToken: string;
};

type RefreshTokenResponse = {
    access_token: string;
    expires_in: string;
    token_type: string;
    refresh_token: string;
    id_token: string;
    user_id: string;
    project_id: string;
};

interface AuthorizationResultToken {
    email_verified: boolean;
    email: string;
    exp: number;
    user_id: string;
    iat: number;
    sub: string;
    aud: string;
    auth_time: number;
    iss: string;
    firebase: {
        identities: { [key: string]: string[] };
        sign_in_provider: string;
    };
}

interface AuthorizationResult {
    r: number;
    b: {
        s: string;
        d: {
            auth: {
                email_verified: boolean;
                provider: string;
                email: string;
                user_id: string;
                token: AuthorizationResultToken;
            };
            uid: string;
        };
        expires: number;
    };
}

type statsRequest = {
    data: {
        action: string;
        familyKey: string;
        prevSyncKey?: string;
    };
};
