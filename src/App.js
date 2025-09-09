// src/App.js

import React from 'react';
// 1. Importa las herramientas de React Router y tus páginas
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  return (
    // 2. Envuelve toda tu aplicación en el componente BrowserRouter
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>Planificador de Tareas y Hábitos</h1>
          {/* 3. Crea los enlaces de navegación con el componente Link */}
          {/* Usa "to" en lugar de "href". Esto evita que la página se recargue. */}
          <nav>
            <Link to="/" style={{ margin: '0 10px' }}>Inicio</Link>
            <Link to="/register" style={{ margin: '0 10px' }}>Registrarse</Link>
          </nav>
        </header>
        <main>
          {/* 4. Define las reglas de enrutamiento. */}
          {/* Aquí le dices a React qué componente mostrar para cada URL. */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;