import React from 'react';
import RegisterForm from './modules/user-management/components/RegisterForm'; // ¡Importa tu componente!
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenido al Planificador de Tareas y Hábitos de Tiger Tech 🐅</h1>
      </header>
      <main>
        {/* Aquí usas tu componente como si fuera una etiqueta HTML */}
        <RegisterForm />
      </main>
    </div>
  );
}

export default App;