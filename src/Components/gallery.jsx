import React, { useState, useEffect } from "react";
import { MediaItem } from "./mediaItem";

import { db } from '../data/firebase'; // Asegúrate de importar correctamente tu configuración de Firebase
import { collection, getDocs, query, where } from "firebase/firestore";

export const Gallery = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = collection(db,'Galeria');
        const q = query(snapshot, where("activo", "==", 1)); // Filtrar por activo = 1
        const galeriaSnapshot = await getDocs(q);
        const galleryItems = galeriaSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            title: data.title,
            largeImage: data.largeImage, // Asegúrate de que el campo en Firestore es el correcto
            smallImage: data.smallImage, // Asumiendo que quieres usar la misma imagen para ambas resoluciones
            video: data.video // Agregar el campo de video

          };
        });
        setData(galleryItems);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div id="portfolio" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Galería</h2>
          <p>
            Explora nuestra galería para ver ejemplos de nuestros proyectos más destacados en servicios eléctricos, construcción y seguridad. Cada imagen refleja nuestro compromiso con la calidad y la atención al detalle, mostrando cómo transformamos espacios con soluciones integrales y efectivas. Descubre cómo nuestro equipo experto ha hecho realidad las necesidades y expectativas de nuestros clientes.
          </p>
        </div>
        <div className="row ">
          <div className="portfolio-items">
            {data.length > 0
              ? data.map((d, i) => (
                  <div
                    key={`${d.title}-${i}`}
                    className="col-sm-6 col-md-4 col-lg-4"
                  >
                     <MediaItem
                      title={d.title}
                      largeImage={d.largeImage}
                      smallImage={d.smallImage}
                      videoUrl={d.video}
                    />
                  </div>
                ))
              : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
};
