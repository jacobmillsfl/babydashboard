import { Layout } from 'plotly.js';
import React from 'react';
import Plot from 'react-plotly.js';

function DiaperGraph(props: { diaperEvents: Array<DiaperEvent> }) {
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
    const wetDiaperStats: number[] = [];
    const dirtyDiaperStats: number[] = [];
    const wetDiapers = props.diaperEvents.filter((x) => x.diaperTypePee);
    const dirtyDiapers = props.diaperEvents.filter((x) => x.diaperTypePoop);

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
      let isWet = wetDiapers.some((event) => {
        return event.beginDt <= time && event.beginDt + fiveMinutes >= time;
      });

      let isDirty = dirtyDiapers.some((event) => {
        return event.beginDt <= time && event.beginDt + fiveMinutes >= time;
      });

      wetDiaperStats.push(isWet ? 1 : 0);
      dirtyDiaperStats.push(isDirty ? 1 : 0);
    }

    return {
      x: xAxisValues,
      y: {
        wet: wetDiaperStats,
        dirty: dirtyDiaperStats
      }
    };
  };

  const axisValues = generateAxisValues();
  const data = [
    {
      x: axisValues.x,
      y: axisValues.y.wet,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(255, 99, 132, 0.7)' },
      fill: 'tozeroy',
      name: 'Wet'
    },
    {
      x: axisValues.x,
      y: axisValues.y.dirty,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(139, 69, 19, 0.7)' },
      fill: 'tozeroy',
      name: 'Dirty'
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

  // Define the layout for the Plotly graph
  const layout: Partial<Layout> = {
    title: 'Diapers in the Past 12 Hours',
    xaxis: {
      title: '',
      tickmode: 'array',
      tickvals: tickvals, // Use the generated x-axis values as tickvals
      tickangle: -45 // Rotate x-axis labels for better readability
    },
    yaxis: {
      title: '',
      tickmode: 'array',
      tickvals: [0, 1],
      ticktext: ['', '']
    },
    margin: { t: 60, r: 30, l: 50, b: 60 }, // Adjust margins for better layout
    height: 200
  };

  return <Plot data={data} layout={layout} />;
}

export default DiaperGraph;
