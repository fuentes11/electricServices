import React, { useState, useEffect } from "react";
import { db } from "./DB/DB"; // Asegúrate de que esta ruta sea correcta
import { collection, getDocs, query, where } from "firebase/firestore";
import ServiceCard from "./Components/ServiceCard";
import "./Home.css"; // Agrega tu archivo de estilos aquí

function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, "Services");
        const q = query(servicesCollection, where("activo", "==", 1)); // Filtrar por activo = 1
        const servicesSnapshot = await getDocs(q);
        const servicesList = servicesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            image: data.images[0] || "", // Selecciona la primera imagen
            description: data.description,
          };
        });
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services: ", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div>
      <main className="main-content">
        <div className="service-cards">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.name}
              image={service.image}
              details={service.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
