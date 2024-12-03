import React, { useState, useEffect } from "react";
import { db } from "../DB/DB"; // Asegúrate de que la configuración de Firebase esté correctamente importada
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const Contactar = () => {
  const [contactos, setContactos] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  useEffect(() => {
    const fetchContactos = async () => {
      const q = query(collection(db, "Contactar"), where("activo", "==", 1));
      const querySnapshot = await getDocs(q);
      const fetchedContacts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContactos(fetchedContacts);
    };

    fetchContactos();
  }, []);

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts((prevSelected) => {
      if (prevSelected.includes(contactId)) {
        return prevSelected.filter((id) => id !== contactId);
      } else {
        return [...prevSelected, contactId];
      }
    });
  };

  const handleContactadosClick = async () => {
    const batch = selectedContacts.map(async (contactId) => {
      const contactRef = doc(db, "Contactar", contactId);
      await updateDoc(contactRef, { activo: 0 });
    });

    try {
      await Promise.all(batch);
      alert("Contactos actualizados exitosamente");
      setContactos((prevContactos) =>
        prevContactos.filter(
          (contact) => !selectedContacts.includes(contact.id)
        )
      );
      setSelectedContacts([]);
    } catch (error) {
      console.error("Error al actualizar los contactos: ", error);
    }
  };

  return (
    <div className="contactar">
      <h1>Contactos Pendientes</h1>
      <div className="contact-list">
        {contactos.length === 0 ? (
          <p>No hay contactos pendientes.</p>
        ) : (
          contactos.map((contact) => (
            <div key={contact.id} className="contact-card">
              <input
                type="checkbox"
                className="contact-checkbox"
                checked={selectedContacts.includes(contact.id)}
                onChange={() => handleCheckboxChange(contact.id)}
              />
              <div className="contact-info">
                <h2>
                  {contact.nombre} {contact.apellido}
                </h2>
                <p>
                  <strong>Teléfono:</strong> {contact.telefono}
                </p>
                <p>
                  <strong>Correo:</strong> {contact.correo}
                </p>
                <div className="items-list">
                  <p>
                    <strong>Carrito:</strong>
                  </p>
                  {contact.items.length > 0 ? (
                    <ul>
                      {contact.items.map((item) => (
                        <li key={item.id} className="item-details">
                          <span>{item.name}</span>
                          <span>
                            {item.quantity} x {item.price}
                          </span>
                          <span>= {item.total}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay ítems en el carrito.</p>
                  )}
                </div>
                <p>
                  <strong>Cantidad total:</strong> {contact.subtotal}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="contacted-button"
        onClick={handleContactadosClick}
        disabled={selectedContacts.length === 0}
      >
        Marcar como Contactado
      </button>
    </div>
  );
};

export default Contactar;
