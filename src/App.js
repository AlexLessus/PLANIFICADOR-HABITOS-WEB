import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage/Dashboard';
import SignIn from './pages/sign-in/SignIn';
import SignUp from './pages/sign-up/SignUp';
import './App.css';

import Habits from './pages/Habits/Habits';
import Tasks from './pages/Task/Tasks';
import Progress from './pages/Progress/Progress';
import Calendary from './pages/Calendary/Calendary';

// 1. Importa el proveedor de autenticación
import { AuthProvider } from './context/AuthContext'; 

// 2. Importa el componente de ruta protegida
import PrivateRoute from './components/PrivateRoute'; 

function App() {
  return (
    // 3. Envuelve toda la aplicación con el AuthProvider
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendary" element={<Calendary />} />
          <Route path="/progress" element={<Progress />} />

          {/* 4. Protege la ruta del dashboard con PrivateRoute */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;