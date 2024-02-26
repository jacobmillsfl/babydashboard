import React, { createContext, useContext, useState } from 'react';
import LocalStorageManager from '../Utils/LocalStorageManager';

interface AppData {
    isAuthenticated: boolean;
    trackz: Trackz;

    setIsAuthenticated: (val: boolean) => void;
    setTrackz: (trackz: Trackz) => void;
}

const AppContext = createContext<AppData>({
    isAuthenticated: false,
    trackz: {},
    setIsAuthenticated: function (val: boolean): void {
        throw new Error('Function not implemented.');
    },
    setTrackz: function (trackz: Trackz): void {
        throw new Error('Function not implemented.');
    },
});

// Custom hook to access the context
export const useAppContext = () => useContext(AppContext);

// Provider component to wrap your app and provide the context
export const AppContextProvider: React.FC = ({ children }) => {
    const localStorageManager = LocalStorageManager.getInstance();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(localStorageManager.getIdToken().length > 0);
    const [trackz, setTrackz] = useState<Trackz>(localStorageManager.getTrackz());

    return (
        <AppContext.Provider
            value={{
                isAuthenticated: isAuthenticated,
                trackz: trackz,
                setIsAuthenticated: setIsAuthenticated,
                setTrackz: setTrackz,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
