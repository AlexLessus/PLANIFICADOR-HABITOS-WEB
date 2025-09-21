import React, { useState } from 'react';
import './RegisterForm.css';

function RegisterForm() {
    // --- ESTADO DEL COMPONENTE ---
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        contraseña: ''
    });

    const [mensaje, setMensaje] = useState(''); // Para mostrar feedback al usuario

    // --- MANEJADOR DE CAMBIOS ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // --- MANEJADOR DE ENVÍO ---
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const res = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje('¡Registro exitoso!');
                setForm({ nombre: '', apellido: '', email: '', contraseña: '' }); // Limpiar formulario
            } else {
                setMensaje(`Error: ${data.message}`);
            }
        } catch (error) {
            setMensaje('Error al conectarse al servidor');
            console.error(error);
        }
    };

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="register-form-container">
            <h2>Crear una Cuenta</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Apellido:</label>
                    <input
                        type="text"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Correo Electrónico:</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="contraseña"
                        value={form.contraseña}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-button">Registrarse</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}

export default RegisterForm;