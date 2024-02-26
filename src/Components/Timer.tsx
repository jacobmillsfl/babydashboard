import React, { useState, useEffect } from 'react';

interface TimerProps {
  beginDt: number;
}

const Timer: React.FC<TimerProps> = ({ beginDt }) => {
  const [timer, setTimer] = useState<string>('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - beginDt;

      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

      const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      setTimer(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [beginDt]);

  const pad = (value: number): string => {
    return value < 10 ? '0' + value : value.toString();
  };

  return <div className="text-xl">{timer}</div>;
};

export default Timer;
