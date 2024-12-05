import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../data/firebase'; // Importa la configuración de Firebase
import '../../login.css'; // Archivo CSS para los estilos

const Login = () => {
  const [user, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Consulta a la colección "usuarios"
      const usersRef = collection(db, 'usuarios'); // Nombre de tu colección en Firebase
      const q = query(
        usersRef,
        where('user', '==', user),
        where('password', '==', password),
        where('activo', '==', 1) // Condición para usuarios activos
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('Login exitoso');
        setError('');
        navigate('/mantenimiento-reporte'); // Redirige a la vista "Mantenimiento Reporte"
      } else {
        setError('Credenciales inválidas o usuario inactivo.');
      }
    } catch (err) {
      console.error('Error al autenticar:', err);
      setError('Ocurrió un error. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Bienvenido</h1>
        <p className="login-subtitle">Por favor ingrese sus credenciales</p>
        {error && <p className="error-message">{error}</p>} {/* Mensaje de error */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">User</label>
          <input
            id="email"
            className="form-input"
            value={user}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Sign In</button>
      </form>
    </div>
  );
};

export default Login;
