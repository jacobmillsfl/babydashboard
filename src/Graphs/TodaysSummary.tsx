import React, { useState, useEffect } from 'react';
import DataManager from '../Utils/DataManager';

const TodaysSummary: React.FC<{ trackValues: Array<ApiEvent> }> = (props) => {
  const [todaysFeeds, setTodaysFeeds] = useState<FeedEvent[]>();
  const [todaysNaps, setTodaysNaps] = useState<SleepEvent[]>();
  const [todaysDiapers, setTodaysDiapers] = useState<DiaperEvent[]>();
  const [diapersFooter, setDiapersFooter] = useState('');
  const [feedsFooter, setFeedsFooter] = useState('');
  const [napsFooter, setNapsFooter] = useState('');

  const [nursingTimeLeft, setNursingTimeLeft] = useState(0);
  const [nursingTimeRight, setNursingTimeRight] = useState(0);
  const [bottleOunces, setBottleOunces] = useState(0);
  const [napTime, setNapTime] = useState(0);

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  useEffect(() => {
    if (props.trackValues.length > 0) {
      const dataManager = DataManager.getInstance();

      const todaysFeeds = dataManager.getTodaysEventsByType(props.trackValues, 'FEED');
      const todaysNaps = dataManager.getTodaysEventsByType(props.trackValues, 'SLEEP');
      const todaysDiapers = dataManager.getTodaysEventsByType<'DIAPER'>(props.trackValues, 'DIAPER');
  
      const lastFeed = dataManager.getLastEventByType<'FEED'>(props.trackValues, 'FEED');
      const lastNap = dataManager.getLastEventByType<'SLEEP'>(props.trackValues, 'SLEEP');
      const lastDiaper = dataManager.getLastEventByType<'DIAPER'>(props.trackValues, 'DIAPER');
  
      setTodaysFeeds(todaysFeeds);
      setTodaysNaps(todaysNaps);
      setTodaysDiapers(todaysDiapers);
  
      setDiapersFooter(`last diaper at ${dataManager.formatTime(lastDiaper.beginDt)}`);
      setFeedsFooter(`last feed at ${dataManager.formatTime(lastFeed.beginDt)}`);
      setNapsFooter(`last nap at ${dataManager.formatTime(lastNap.beginDt)}`);
  
      const bottleFeeds = todaysFeeds.filter((x) => x.feedType === 'BOTTLE') as Array<BottleEvent>;
      const totalBottleVolume: number = bottleFeeds.reduce(
        (accumulator: number, currentValue: BottleEvent) => accumulator + (currentValue?.bottleVolume ?? 0),
        0
      );

      const breastFeeds = todaysFeeds.filter((x) => x.feedType === 'BREAST') as Array<BreastEvent>;
      const totalLeftBreastVolume: number = breastFeeds.reduce(
        (accumulator: number, currentValue: BreastEvent) => accumulator + (currentValue.breastLeftDuration ?? 0),
        0
      );
      const totalRightBreastVolume: number = breastFeeds.reduce(
        (accumulator: number, currentValue: BreastEvent) => accumulator + (currentValue.breastRightDuration ?? 0),
        0
      );

      const totalNapTime = todaysNaps.filter(x => x.endDt !== undefined).reduce(
        (accumulator: number, currentValue: SleepEvent) => accumulator + 
          (currentValue.endDt ? currentValue.endDt : currentValue.beginDt ) - currentValue.beginDt,
        0
      );
  
      setBottleOunces(totalBottleVolume * 0.1);
      setNursingTimeLeft(Math.floor(totalLeftBreastVolume / 1000));
      setNursingTimeRight(Math.floor(totalRightBreastVolume / 1000));
      setNapTime(Math.floor(totalNapTime) / 1000);
    }
  }, [props.trackValues]);

  return (
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow-md rounded-md">
          <h2>Today's Diapers</h2>
          <p className="text-center text-5xl mb-1">{todaysDiapers?.length ?? 0}</p>
          <hr />
          <div className="flex justify-around">
            <div className="text-center">
              <span role="img" aria-label="Water Drop" className="text-4xl block">
                💧
              </span>
              <p className="text-lg">{todaysDiapers?.filter((x) => x.diaperTypePee).length ?? 0}</p>
            </div>
            <div className="text-center">
              <span role="img" aria-label="Poo Emoji" className="text-4xl block">
                💩
              </span>
              <p className="text-lg">{todaysDiapers?.filter((x) => x.diaperTypePoop).length ?? 0}</p>
            </div>
          </div>
          <hr />
          <p className="text-sm mt-1 italic">{diapersFooter}</p>
        </div>

        <div className="bg-white p-4 shadow-md rounded-md">
          <h3>Today's Feeds</h3>
          <p className="text-center text-5xl mb-1">{todaysFeeds?.length ?? 0}</p>
          <hr />
          <div className="flex justify-around">
            <div className="text-center">
            <span role="img" aria-label="Left Breast Emoji" className="text-4xl block font-serif">
                (. )
              </span>
              <p className="text-lg">{formatTime(nursingTimeLeft)}</p>
            </div>
            <div className="text-center">
            <span role="img" aria-label="Right Breast Emoji" className="text-4xl block font-serif">
                ( .)
              </span>
              <p className="text-lg">{formatTime(nursingTimeRight)}</p>
            </div>
            <div className="text-center">
            <span role="img" aria-label="Water Drop" className="text-4xl block">
            🍼
              </span>
              
              <p className="text-lg">{bottleOunces.toPrecision(2)} Oz</p>
            </div>
          </div>
          <hr />
          <p className="text-sm mt-1 italic">{feedsFooter}</p>
        </div>
        <div className="bg-white p-4 shadow-md rounded-md">
          <h3>Today's Naps</h3>
          <p className="text-center text-5xl mb-1">{todaysNaps?.length ?? 0}</p>
          <hr />
          <div className="flex justify-around">
            <div className="text-center">
              <span role="img" aria-label="Water Drop" className="text-4xl block">
              💤
              </span>
              <p className="text-lg">{formatTime(napTime)}</p>
            </div>
          </div>
          <hr /> 
          <p className="text-sm mt-1 italic">{napsFooter}</p>
        </div>
      </div>
    </div>
  );
};

export default TodaysSummary;
