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

  // Calculate average values for each group
  const averageDiapers = diapersThisWeek.reduce((acc, val) => acc + val, 0) / diapersThisWeek.length;
  const averageFeeds = feedsThisWeek.reduce((acc, val) => acc + val, 0) / feedsThisWeek.length;
  const averageNaps = napsThisWeek.reduce((acc, val) => acc + val, 0) / napsThisWeek.length;

  // Create arrays to plot the average lines
  const averageLineX = pastSevenDayNames;
  const averageLineYDiapers = Array.from({ length: pastSevenDayNames.length }, () => averageDiapers);
  const averageLineYFeeds = Array.from({ length: pastSevenDayNames.length }, () => averageFeeds);
  const averageLineYNaps = Array.from({ length: pastSevenDayNames.length }, () => averageNaps);

  return (
    <div className="overflow-hidden">
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
          { 
            type: 'scatter', 
            mode: 'lines',
            x: averageLineX,
            y: averageLineYDiapers,
            name: 'Average Diapers',
            line: { dash: 'dot', width: 2, color: 'rgba(255, 99, 132, 0.6)' } // Customize line style here
          },
          { 
            type: 'scatter', 
            mode: 'lines',
            x: averageLineX,
            y: averageLineYFeeds,
            name: 'Average Feeds',
            line: { dash: 'dot', width: 2, color: 'rgba(54, 162, 235, 0.6)' } // Customize line style here
          },
          { 
            type: 'scatter', 
            mode: 'lines',
            x: averageLineX,
            y: averageLineYNaps,
            name: 'Average Naps',
            line: { dash: 'dot', width: 2, color: 'rgba(75, 192, 192, 0.6)' } // Customize line style here
          }
        ]}
        layout={{ barmode: 'group', title: '7 Day Overview', height: 630}}
      />
    </div>
  );
  
}

export default SevenDayOverview;
