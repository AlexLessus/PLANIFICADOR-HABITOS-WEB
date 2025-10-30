// src/pages/Progress/CircularHabitTracker.jsx
import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import './CircularHabitTracker.css';

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

const SingleHabitCircle = ({ habit, completions, month, year, onDayClick }) => {
  const totalDays = daysInMonth(month, year);
  const dayElements = [];
  const radius = 80; // tamaño del círculo individual

  for (let i = 1; i <= totalDays; i++) {
    const angle = (i / totalDays) * 2 * Math.PI - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    const date = new Date(year, month, i);
    const dateString = date.toISOString().split('T')[0];
    const isCompleted = completions.has(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isMissed = !isCompleted && date < today;

    let dayClass = 'day-cell';
    if (isCompleted) dayClass += ' completed';
    else if (isMissed) dayClass += ' missed';

    dayElements.push(
      <div
        key={i}
        className={dayClass}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        onClick={() => onDayClick(habit.id, dateString, isCompleted)}
        title={`Día ${i}`}
      />
    );
  }

  return (
    <Card className="habit-card">
      <CardContent>
        <Typography variant="h6" align="center" gutterBottom>
          {habit.title}
        </Typography>
        <div className="single-habit-circle">{dayElements}</div>
      </CardContent>
    </Card>
  );
};

const CircularHabitTracker = ({ habits, completions, onDayClick }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthName = today.toLocaleString('es-ES', { month: 'long' });

  const completionsByHabit = new Map();
  habits.forEach(h => completionsByHabit.set(h.id, new Set()));
  completions.forEach(c => {
    if (completionsByHabit.has(c.habit_id)) {
      const dateOnly = c.completion_date.split('T')[0];
      completionsByHabit.get(c.habit_id).add(dateOnly);
    }
  });

  return (
    <div className="tracker-container">
      <Typography variant="h5" component="h2" gutterBottom>
        Seguimiento de Hábitos – {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
      </Typography>

      {habits.length === 0 ? (
        <Typography>No tienes hábitos registrados. ¡Crea uno para empezar!</Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {habits.map((habit) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={habit.id}>
              <SingleHabitCircle
                habit={habit}
                completions={completionsByHabit.get(habit.id) || new Set()}
                month={currentMonth}
                year={currentYear}
                onDayClick={onDayClick}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default CircularHabitTracker;
