// src/pages/Progress/AnnualHabitHeatmap.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import "./AnnualHabitHeatmap.css";

// Genera todas las fechas del año
const generateYearDays = (year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
};

// Componente Heatmap
const AnnualHabitHeatmap = ({ completions, year }) => {
  const days = generateYearDays(year);

  // Fechas completadas
  const completed = new Set(completions.map(c => c.completion_date.split("T")[0]));

  return (
    <Box className="heatmap-wrapper">
      <Typography variant="h6" className="heatmap-year">{year}</Typography>
      <Box className="heatmap-grid">
        {days.map((day, i) => {
          const dateKey = day.toISOString().split("T")[0];
          const isCompleted = completed.has(dateKey);

          return (
            <div
              key={i}
              className={`heatmap-cell ${isCompleted ? "completed" : "empty"}`}
              title={`${dateKey} ${isCompleted ? "✔ Hábito cumplido" : "✖ Sin registro"}`}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default AnnualHabitHeatmap;
