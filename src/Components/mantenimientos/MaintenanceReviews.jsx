import React, { useState, useEffect } from "react";
import { db } from '../../data/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Modal from 'react-modal';

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,  // Añadir un z-index alto al overlay.
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
    zIndex: 1001,  // Asegurarse de que el contenido esté encima del overlay.
  },
};


const MaintenanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const fetchReviews = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'reseñas'));
      const reviewsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsList);
    } catch (error) {
      console.error("Error fetching reviews: ", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openEditModal = (review) => {
    setCurrentReview(review);
    setName(review.name);
    setText(review.body);
    setStars(review.estrellas);
    setModalIsOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const reviewDoc = doc(db, 'reseñas', currentReview.id);
      await updateDoc(reviewDoc, {
        name,
        body: text,
        estrellas: stars,
      });
      setModalIsOpen(false);
      fetchReviews();
    } catch (error) {
      console.error("Error updating review: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'reseñas', id));
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review: ", error);
    }
  };

  const renderStars = (num, hovered) => {
    const starsArray = [];
    for (let i = 1; i <= 5; i++) {
      starsArray.push(
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
    return starsArray;
  };

  return (
    <div id="maintenance-reviews" style={{ marginBottom: '40px' }}>
      <div className="container">
        <div className="section-title text-center">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Mantenimiento de Reseñas</h2>
        </div>
        <div className="row">
          {reviews.length > 0 ? reviews.map((review, i) => (
            <div key={review.id} className="col-md-4" style={{ marginBottom: '30px' }}>
              <div className="testimonial" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
                <div className="stars" style={{ marginBottom: '10px', color: '#ffd700' }}>
                  {renderStars(review.estrellas)}
                </div>
                <div className="testimonial-content">
                  <p style={{ marginBottom: '10px', fontStyle: 'italic' }}>"{review.body}"</p>
                  <div className="testimonial-meta" style={{ marginBottom: '20px', fontWeight: 'bold', color: '#555' }}> - {review.name} </div>
                  <div className="btn-group" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => openEditModal(review)} className="btn btn-warning" style={{ backgroundColor: '#fdb86ab9', border: 'none', fontWeight: 'bold',color: '#333', borderRadius: '5px', padding: '10px 15px' }}>Editar</button>
                    <button onClick={() => handleDelete(review.id)} className="btn btn-danger" style={{ backgroundColor: '#fdb86ab9', border: 'none', fontWeight: 'bold',color: '#333', borderRadius: '5px', padding: '10px 15px' }}>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          )) : "Cargando..."}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={modalStyles}
        contentLabel="Editar Reseña"
      >
        <h2 className="modal-title" style={{ marginBottom: '20px', color: '#333' }}>Editar Reseña</h2>
        <form onSubmit={handleUpdate} className="review-form">
          <div className="form-group">
            <label htmlFor="name" style={{ marginBottom: '5px', color: '#555' }}>Nombre:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginBottom: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="text" style={{ marginBottom: '5px', color: '#555' }}>Comentario:</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              style={{ marginBottom: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
            />
          </div>
          <div className="form-group stars-rating">
            <label htmlFor="stars" style={{ marginBottom: '5px', color: '#555' }}>Calificación:</label>
            <div
              className="stars"
              onMouseLeave={() => setHoveredStar(0)}
              style={{ marginBottom: '20px' }}
            >
              {renderStars(stars, hoveredStar)}
            </div>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={{ marginRight: '10px', backgroundColor: '#fdb86ab9', border: 'none',fontWeight: 'bold', color: '#333', borderRadius: '5px', padding: '10px 20px' }}>Guardar</button>
            <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)} style={{ backgroundColor: '#fdb86ab9', border: 'none', fontWeight: 'bold',color: '#333', borderRadius: '5px', padding: '10px 20px' }}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceReviews;
