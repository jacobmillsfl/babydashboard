import { Layout } from 'plotly.js';
import React from 'react';
import Plot from 'react-plotly.js';

function FeedGraph(props: { feedEvents: Array<FeedEvent> }) {
  const fiveMinutes = 5 * 60 * 1000;
  const twelveHours = 12 * 60 * 60 * 1000;
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - twelveHours);
  const startOfHour = new Date(
    twelveHoursAgo.getFullYear(),
    twelveHoursAgo.getMonth(),
    twelveHoursAgo.getDate(),
    twelveHoursAgo.getHours(),
    0,
    0
  );

  const generateAxisValues = () => {
    const xAxisValues: string[] = [];
    const breastFeedData: number[] = [];
    const bottleFeedData: number[] = [];
    const breastFeedings = props.feedEvents.filter((x) => x.feedType === 'BREAST') as Array<BreastEvent>;
    const bottleFeedings = props.feedEvents.filter((x) => x.feedType === 'BOTTLE') as Array<BottleEvent>;

    for (let time = startOfHour.getTime(); time < now.getTime(); time += fiveMinutes) {
      // X-Axis
      const date = new Date(time);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format
      const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      xAxisValues.push(formattedTime);

      // Y-Axis
      let breastFeeding = breastFeedings.some((event) => {
        return (
          event.beginDt <= time &&
          event.beginDt + (event.breastLeftDuration ?? 0) + (event.breastRightDuration ?? 0) + fiveMinutes >= time
        );
      });
      let bottleFeeding = bottleFeedings.some((event) => {
        return event.beginDt <= time && event.beginDt + fiveMinutes >= time;
      });

      breastFeedData.push(breastFeeding ? 1 : 0);
      bottleFeedData.push(bottleFeeding ? 1 : 0);
    }

    return {
      x: xAxisValues,
      y: {
        breast: breastFeedData,
        bottle: bottleFeedData
      }
    };
  };

  // Generate x-axis and y-axis values
  const axisValues = generateAxisValues();

  // Define the data for the plot
  const data = [
    {
      x: axisValues.x,
      y: axisValues.y.bottle,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#B1429E' },
      fill: 'tozeroy',
      name: 'Bottle'
    },
    {
      x: axisValues.x,
      y: axisValues.y.breast,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#3182CE' },
      fill: 'tozeroy',
      name: 'Breast'
    }
  ] as Plotly.Data[];

  // Find the indices of xAxisValues that represent the beginning of each hour
  const hourIndices: number[] = [];
  let currentHour = -1;
  axisValues.x.forEach((value, index) => {
    const hour = parseInt(value.split(':')[0]);
    if (hour !== currentHour) {
      hourIndices.push(index);
      currentHour = hour;
    }
  });

  const tickvals = hourIndices.map((index) => axisValues.x[index]);

  const layout: Partial<Layout> = {
    title: 'Feeds in the Past 12 Hours',
    xaxis: {
      title: '',
      tickmode: 'array',
      tickvals: tickvals,
      tickangle: -45
    },
    yaxis: {
      title: '',
      tickmode: 'array',
      tickvals: [0, 1],
      ticktext: ['', '']
    },
    margin: { t: 60, r: 30, l: 50, b: 60 },
    height: 200
  };

  return <Plot data={data} layout={layout} />;
}

export default FeedGraph;
