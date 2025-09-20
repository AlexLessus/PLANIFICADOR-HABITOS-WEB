import React from 'react';
// 1. Importa las herramientas de React Router y tus páginas
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage/Dashboard';
import SignIn from './pages/sign-in/SignIn';
import SignUp from './pages/sign-up/SignUp';
import Habits from './pages/Habits/Habits';
import Tasks from './pages/Task/Tasks';
import Progress from './pages/Progress/Progress';
import Calendary from './pages/Calendary/Calendary';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendary" element={<Calendary />} />
        <Route path="/progress" element={<Progress />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;