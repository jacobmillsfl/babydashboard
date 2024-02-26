import { Layout } from 'plotly.js';
import React from 'react';
import Plot from 'react-plotly.js';

function SleepGraph(props: { sleepEvents: Array<SleepEvent> }) {
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
    const yAxisValues: number[] = [];

    for (let time = startOfHour.getTime(); time < now.getTime(); time += fiveMinutes) {
      // X-Axis
      const date = new Date(time);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      xAxisValues.push(formattedTime);

      // Y-Axis
      const isAsleep = props.sleepEvents.some((event) => {
        return event.beginDt <= time && (event.endDt ?? time) >= time;
      });

      yAxisValues.push(isAsleep ? 1 : 0);
    }

    return {
      x: xAxisValues,
      y: yAxisValues
    };
  };

  const axisValues = generateAxisValues();
  const data = [
    {
      x: axisValues.x,
      y: axisValues.y,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(75, 192, 192, 0.7)' },
      fill: 'tozeroy',
      name: 'Sleep'
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
    title: 'Sleeps in the Past 12 Hours',
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

export default SleepGraph;
