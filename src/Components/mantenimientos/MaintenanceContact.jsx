import React, { useState, useEffect } from "react";
import { db } from '../../data/firebase';
import { collection, getDocs, query, where,updateDoc, doc } from "firebase/firestore";




const MaintenanceContact = () => {
  const [contacts, setContacts] = useState([]);
 
  const [selectedContacts, setSelectedContacts] = useState([]);

  const fetchContacts = async () => {
    try {
      const q = query(collection(db, "Contactar"), where("activo", "==", 1));
      const snapshot = await getDocs(q);
      const contactsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error("Error fetching contacts: ", error);
    }
  };

  useEffect(() => {
    fetchContacts();
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

  const handleMarkAsContacted = async () => {
    const batch = selectedContacts.map(async (contactId) => {
      const contactRef = doc(db, 'Contactar', contactId);
      await updateDoc(contactRef, { activo: 0 });
    });

    try {
      await Promise.all(batch);
      alert("Contactos marcados como contactados.");
      setContacts((prevContacts) =>
        prevContacts.filter(
          (contact) => !selectedContacts.includes(contact.id)
        )
      );
      setSelectedContacts([]);
    } catch (error) {
      console.error("Error marking contacts as contacted: ", error);
    }
  };

  return (
    <div id="maintenance-contact" style={{ marginBottom: '40px',backgroundColor:'#faf6ea' }}>
      <div className="container">
        <div className="section-title text-center">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Mantenimiento de Contactos</h2>
        </div>
        <div className="row">
          {contacts.length > 0 ? contacts.map((contact) => (
            <div key={contact.id} className="col-md-4" style={{ marginBottom: '30px' }}>
              <div className="contact-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
                <div className="contact-info">
                <h3 style={{ marginBottom: '10px', color: '#555' }}>
                  {contact.nombre + ' ' + contact.apellido}
                </h3><p style={{ marginBottom: '10px' }}><strong>Teléfono:</strong> {contact.telefono}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Correo:</strong> {contact.correo}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Servicio:</strong> {contact.serviceName}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Direccion:</strong> {contact.direccion}</p>
                  <p style={{ marginBottom: '10px' }}><strong>otro:</strong> {contact.otro}</p>

                </div>
                <div className="btn-group" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                  <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleCheckboxChange(contact.id)}
                  style={{ marginRight: '10px', width: '24px', height: '24px' }} // Aumenta el tamaño del checkbox
                  />
                  Seleccionar
                </label>

                </div>
              </div>
            </div>
          )) : "Cargando..."}
        </div>
        <div className="text-center">
          <button
            onClick={handleMarkAsContacted}
            className="btn btn-primary"
            style={{ backgroundColor: '#fdb86ab9', border: 'none', fontWeight: 'bold', color: '#333', borderRadius: '5px', padding: '10px 20px' }}
            disabled={selectedContacts.length === 0}
          >
            Marcar como Contactado
          </button>
        </div>
      </div>

     
    </div>
  );
};

export default MaintenanceContact;
