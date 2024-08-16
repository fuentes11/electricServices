import React from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../DB/DB"; // Ajusta la ruta según tu estructura de archivos
import { collection, addDoc, Timestamp } from "firebase/firestore";
import "../ServiceCard.css"; // Asegúrate de importar el archivo CSS

function ServiceCard({ id, title, image }) {
  const navigate = useNavigate();

  const handleMoreInfo = async () => {
    // Registra el clic en Firebase
    try {
      const clicksCollection = collection(db, "Clicks");
      await addDoc(clicksCollection, {
        serviceId: id,
        serviceName: title,
        clickDate: Timestamp.fromDate(new Date()), // Fecha y hora actuales
        activo: 1,
      });
    } catch (error) {
      console.error("Error registering click: ", error);
    }

    // Navega a la página de detalles del producto
    navigate(`/product/${id}`);
  };

  return (
    <div className="service-card">
      <div className="service-image-container">
        <img src={image} alt={title} className="service-image" />
      </div>
      <div className="service-info">
        <h3>{title}</h3>
        <button className="info-button" onClick={handleMoreInfo}>
          Más Información
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;
