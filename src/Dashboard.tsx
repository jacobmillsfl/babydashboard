import React, { useEffect, useState } from 'react';
import LocalStorageManager from './Utils/LocalStorageManager';
import DataManager from './Utils/DataManager';
import SevenDayOverview from './Graphs/SevenDayOverview';
import Timer from './Components/Timer';
import TodaysSummary from './Graphs/TodaysSummary';
import SleepGraph from './Graphs/SleepGraph';
import FeedGraph from './Graphs/FeedGraph';
import DiaperGraph from './Graphs/DiaperGraph';
import { useAppContext } from './Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import ApiClient from './Utils/ApiClient';

function Dashboard() {
    const localStorageManager = LocalStorageManager.getInstance();
    const apiClient = ApiClient.getInstance();
    const dataManager = DataManager.getInstance();
    const navigate = useNavigate();
    const context = useAppContext();

    const [trackValues, setTrackValues] = useState<Array<ApiEvent>>(new Array());
    const [totalDiaperCount, setTotalDiaperCount] = useState(0);
    const [totalFeedCount, setTotalFeedCount] = useState(0);
    const [totalSleepCount, setTotalSleepCount] = useState(0);
    const [totalDiapersFooter, setTotalDiapersFooter] = useState('');
    const [totalFeedsFooter, setTotalFeedsFooter] = useState('');
    const [totalNapsFooter, setTotalNapsFooter] = useState('');
    const [lastNap, setLastNap] = useState<SleepEvent>();
    const [isAsleep, setIsAsleep] = useState(false);

    const updateDashboard = () => {
        const trackz = localStorageManager.getTrackz();
        const trackValues = Object.values(trackz);
        setTrackValues(trackValues);

        const totalDiapers = dataManager.getEventsByType(trackValues, 'DIAPER');
        const totalFeeds = dataManager.getEventsByType(trackValues, 'FEED');
        const totalNaps = dataManager.getEventsByType(trackValues, 'SLEEP');

        const firstDiaper = dataManager.getFirstEventByType(trackValues, 'DIAPER');
        const firstFeed = dataManager.getFirstEventByType(trackValues, 'FEED');
        const firstNap = dataManager.getFirstEventByType(trackValues, 'SLEEP');

        const lastFeed = dataManager.getLastEventByType<'FEED'>(trackValues, 'FEED');
        const lastNap = dataManager.getLastEventByType<'SLEEP'>(trackValues, 'SLEEP');
        const lastDiaper = dataManager.getLastEventByType<'DIAPER'>(trackValues, 'DIAPER');

        setTotalDiaperCount(totalDiapers.length);
        setTotalFeedCount(totalFeeds.length);
        setTotalSleepCount(totalNaps.length);

        setTotalDiapersFooter(`since ${new Date(firstDiaper.beginDt).toDateString()}`);
        setTotalFeedsFooter(`since ${new Date(firstFeed.beginDt).toDateString()}`);
        setTotalNapsFooter(`since ${new Date(firstNap.beginDt).toDateString()}`);

        setLastNap(lastNap);

        if (lastNap.endDt === undefined) {
            setIsAsleep(true);
        }
    };

    const syncData = () => {
        dataManager.syncData().then((success) => {
            if (success) {
                updateDashboard();
            } else {
                console.error('ERROR SYNCING DATA');
            }
        });
    };

    useEffect(() => {
        if (!context.isAuthenticated) {
            console.log('Authentication required... Redirecting to login.');
            navigate('/login');
        } else {
            apiClient.refreshSession().then((refreshed: boolean) => {
                console.log(`ID Token ${refreshed ? 'refreshed' : 'not refreshed'}`);
                syncData();
            });
        }
    }, []);

    return (
        <>
            {/* Status Indicator */}
            {isAsleep && lastNap && (
                <div
                    className="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md"
                    role="alert"
                >
                    <div className="flex">
                        <div className="py-1">
                            <svg
                                className="fill-current h-6 w-6 text-blue-500 mr-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 0c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 15h-2v-2h2v2zm0-4h-2v-6h2v6z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold">Melody is sleeping!</p>
                            <div className="flex items-center">
                                <p className="text-sm mr-2">Nap Length:</p>
                                <Timer beginDt={lastNap.beginDt} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Content */}

            <TodaysSummary trackValues={trackValues} />

            <div className="container mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-4 shadow-md rounded-md">
                    <SleepGraph sleepEvents={trackValues.filter((x) => x.type === 'SLEEP') as Array<SleepEvent>} />
                    <FeedGraph feedEvents={trackValues.filter((x) => x.type === 'FEED') as Array<FeedEvent>} />
                    <DiaperGraph diaperEvents={trackValues.filter((x) => x.type === 'DIAPER') as Array<DiaperEvent>} />
                </div>
                <div className="bg-white p-4 shadow-md rounded-md">
                    <SevenDayOverview trackValues={trackValues} />
                </div>
            </div>

            <div className="container mx-auto mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 shadow-md rounded-md">
                        <h2>Total Daipers</h2>
                        <p className="text-center text-5xl mb-1">{totalDiaperCount}</p>
                        <hr />
                        <p className="text-sm mt-1 italic">{totalDiapersFooter}</p>
                    </div>
                    <div className="bg-white p-4 shadow-md rounded-md">
                        <h3>Total Feeds</h3>
                        <p className="text-center text-5xl mb-1">{totalFeedCount}</p>
                        <hr />
                        <p className="text-sm mt-1 italic">{totalFeedsFooter}</p>
                    </div>
                    <div className="bg-white p-4 shadow-md rounded-md">
                        <h3>Total Naps</h3>
                        <p className="text-center text-5xl mb-1">{totalSleepCount}</p>
                        <hr />
                        <p className="text-sm mt-1 italic">{totalNapsFooter}</p>
                    </div>
                </div>
            </div>

            {/* <SpaceHud /> */}

            {/* Footer */}
        </>
    );
}

export default Dashboard;
