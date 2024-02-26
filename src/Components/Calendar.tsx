import React, { useState } from 'react';

function Calendar() {
  // Define currentDate and selectedDay as state variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDay());

  // Extract current year and month from currentDate
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create an array representing the days of the month
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Function to handle next month
  const nextMonth = () => {
    setCurrentDate(prevDate => {
      const nextDate = new Date(prevDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      return nextDate;
    });
  };

  // Function to handle previous month
  const prevMonth = () => {
    setCurrentDate(prevDate => {
      const prevDateCopy = new Date(prevDate);
      prevDateCopy.setMonth(prevDateCopy.getMonth() - 1);
      return prevDateCopy;
    });
  };

  // Function to handle day click
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-md text-sm">
      <div className="flex justify-between mb-4">
        <button className="px-2 py-1 bg-blue-500 text-white rounded-md" onClick={prevMonth}>
          &#x2190; {/* Left arrow */}
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentYear}
        </h2>
        <button className="px-2 py-1 bg-blue-500 text-white rounded-md" onClick={nextMonth}>
          &#x2192; {/* Right arrow */}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {/* Render day labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-center">{day}</div>
        ))}
        {/* Fill in blank spaces for the first week */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={i}></div>
        ))}
        {/* Render days of the month */}
        {daysArray.map((day) => (
          <div
            key={day}
            className={`text-center ${day === selectedDay ? 'bg-blue-500 text-white rounded-md' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
