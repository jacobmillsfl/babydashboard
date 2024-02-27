import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function SevenDayOverview(props: { trackValues: Array<ApiEvent> }) {

  const diapersThisWeek = new Array<number>();
  const feedsThisWeek = new Array<number>();
  const napsThisWeek = new Array<number>();

  const getPastSevenDayNames = (): string[] => {
    const today = new Date();
    const pastSevenDays: string[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      pastSevenDays.unshift(formatDate(date));
    }

    return pastSevenDays;
  };

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`;
  };

  const isWithinPastSevenDays = (date: Date, today: Date): boolean => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.floor((today.getTime() - date.getTime()) / millisecondsPerDay);
    return diffInDays >= 0 && diffInDays < 7;
  };

  const groupEventsByDate = (events: ApiEvent[]): Record<string, ApiEvent[]> => {
    const today = new Date();
    const pastSevenDays: Record<string, ApiEvent[]> = {};

    events.forEach((event) => {
      const eventDate = new Date(event.beginDt);
      const dateKey = formatDate(eventDate);

      if (isWithinPastSevenDays(eventDate, today)) {
        if (!pastSevenDays[dateKey]) {
          pastSevenDays[dateKey] = [];
        }

        pastSevenDays[dateKey].push(event);
      }
    });

    return pastSevenDays;
  };

  const eventsByDate = groupEventsByDate(props.trackValues);
  const pastSevenDayNames = getPastSevenDayNames();
  for (let day of pastSevenDayNames) {
    const events = eventsByDate[day] ? Object.values(eventsByDate[day]) : [];

    const diapers = events.filter((x) => x.type === 'DIAPER').length;
    const feeds = events.filter((x) => x.type === 'FEED').length;
    const naps = events.filter((x) => x.type === 'SLEEP').length;

    diapersThisWeek.push(diapers);
    feedsThisWeek.push(feeds);
    napsThisWeek.push(naps);
  }

  return (
    <div className="overflow-x-scroll">
      <Plot
        data={[
          {
            x: pastSevenDayNames,
            y: diapersThisWeek,
            name: 'Diapers',
            type: 'bar',
            marker: { color: 'rgba(255, 99, 132, 0.7)' }
          },
          {
            x: pastSevenDayNames,
            y: feedsThisWeek,
            name: 'Feeds',
            type: 'bar',
            marker: { color: 'rgba(54, 162, 235, 0.7)' }
          },
          {
            x: pastSevenDayNames,
            y: napsThisWeek,
            name: 'NAPS',
            type: 'bar',
            marker: { color: 'rgba(75, 192, 192, 0.7)' }
          },
          { type: 'bar' }
        ]}
        layout={{ barmode: 'group', title: '7 Day Overview', height: 630}}
      />
    </div>
  );
  
}

export default SevenDayOverview;
