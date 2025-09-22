import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css'; // Asegúrate de que este archivo exista
import { SitemarkIcon } from '../../shared-theme/CustomIcons';

function AboutUs() {
  return (
    <div className="about-us-container">
      {/* Sección del encabezado con el logo */}
      <header className="header">
        <SitemarkIcon/>

      </header>

      {/* Contenido principal de la página */}
      <main className="main-content">
        <h1 className="main-title">Planificador de tareas y hábitos</h1>
        
        <p className="description">
          "Planificador de Tareas y Hábitos" es una herramienta web creada para ayudarte a organizar tu vida profesional y académica. Como parte de una práctica de desarrollo de software del ITCG, este sistema te permite planificar tus actividades diarias, seguir tus hábitos, recibir recordatorios automáticos y ver tu progreso a través de reportes detallados.
        </p>

        {/* Sección de los botones */}
        <div className="button-group">
          <Link to="/signIn">
            <button className="primary-button">
              Iniciar Sesión
            </button>
          </Link>
          <Link to="/signUp">
            <button className="primary-button">
              Registrarse
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AboutUs;