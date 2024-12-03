import React, { useState, useEffect } from "react";
import { db } from '../data/firebase'; // Asegúrate de importar correctamente tu configuración de Firebase
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import Modal from 'react-modal'; // Puedes instalar react-modal o usar otra librería para modales

// Estilo para el modal
const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '500px',
    width: '100%',
    backgroundColor: '#fff',
    border: 'none',
  },
};

export const Testimonials = () => {
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Función para cargar datos desde Firestore
  const fetchData = async () => {
    try {
      const snapshot = collection(db, 'reseñas');
      const q = query(snapshot, where("activo", "==", 1)); // Filtrar por activo = 1
      const resenasSnapshot = await getDocs(q);
      const testimonials = resenasSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          text: data.body,
          stars: data.estrellas // Asegúrate de que el campo en Firestore es el correcto
        };
      });
      setData(testimonials);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'reseñas'), {
        name,
        body: text,
        estrellas: stars,
        activo: 1 // Marca la reseña como activa
      });
      // Cierra el modal y limpia el formulario
      setModalIsOpen(false);
      setName('');
      setText('');
      setStars(0);
      // Vuelve a cargar los datos
      fetchData();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Función para renderizar estrellas
  const renderStars = (num, hovered) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= (hovered || num) ? 'filled' : ''}`}
          onClick={() => setStars(i)}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(0)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div id="testimonials">
      <div className="container">
        <div className="section-title text-center">
          <h2>Comentarios</h2>
          <button onClick={() => setModalIsOpen(true)} className="btn btn-primary">
            Agregar Reseña
          </button>
        </div>
        <div className="row">
          {data.length > 0
            ? data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-md-4">
                  <div className="testimonial">
                    <div className="stars">
                      {renderStars(d.stars)}
                    </div>
                    <div className="testimonial-content">
                      <p>"{d.text}"</p>
                      <div className="testimonial-meta"> - {d.name} </div>
                    </div>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>

      {/* Modal para agregar reseña */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={modalStyles}
        contentLabel="Agregar Reseña"
      >
        <h2 className="modal-title">Agregar Reseña</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="text">Comentario:</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>
          <div className="form-group stars-rating">
            <label htmlFor="stars">Calificacion:</label>
            <div
              className="stars"
              onMouseLeave={() => setHoveredStar(0)}
            >
              {renderStars(stars, hoveredStar)}
            </div>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">Enviar</button>
            <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


