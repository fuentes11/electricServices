import React, { useState, useEffect } from "react";
import { db, storage } from "../DB/DB"; // Asegúrate de tener la configuración de Firestore y Storage en un archivo firebase.js
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';
import '../Mantenimiento.css'; // Asegúrate de que los estilos estén actualizados

Modal.setAppElement('#root'); // Establece el elemento raíz para el modal

const Mantenimiento = () => {
    const navigate = useNavigate();
    const handleReport = () => {
        navigate('/reporte');
      }
      const handleContactar = () => {
        navigate('/contactar');
      }
  const [services, setServices] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formType, setFormType] = useState(""); // 'crear' o 'modificar'
  const [selectedService, setSelectedService] = useState(null);
  const [formFields, setFormFields] = useState({
    name: '',
    description: '',
    price: '',
    warranty: '',
    characteristics: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, 'Services');
        const snapshot = await getDocs(servicesCollection);
        const servicesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services: ", error);
      }
    };

    fetchServices();
  }, []);

  const handleCreate = () => {
    setFormType("crear");
    setSelectedService(null);
    setFormFields({
      name: '',
      description: '',
      price: '',
      warranty: '',
      characteristics: '',
      images: []
    });
    setImageFiles([]);
    setIsFormVisible(true);
  };

  const handleEdit = (service) => {
    setFormType("modificar");
    setSelectedService(service);
    setFormFields({
      name: service.name,
      description: service.description,
      price: service.price,
      warranty: service.warranty || '',
      characteristics: service.characteristics || '',
      images: service.images
    });
    setImageFiles([]);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const serviceDoc = doc(db, 'Services', id);
      await deleteDoc(serviceDoc);
      setServices(services.filter(service => service.id !== id));
    } catch (error) {
      console.error("Error deleting service: ", error);
    }
  };

  const handleFileChange = (event) => {
    setImageFiles([...event.target.files]);
  };

  const uploadImages = async () => {
    const urls = [];
    const uploadPromises = imageFiles.map((file, index) => {
      const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef)).then(url => {
        urls.push(url);
      });
    });

    await Promise.all(uploadPromises);
    return urls;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const { name, description, price, warranty, characteristics } = event.target.elements;

    try {
      setUploading(true);
      const imageUrls = await uploadImages();
      setUploading(false);

      if (formType === "crear") {
        await addDoc(collection(db, 'Services'), {
          name: name.value,
          description: description.value,
          price: parseFloat(price.value),
          warranty: warranty.value,
          characteristics: characteristics.value,
          images: imageUrls
        });
      } else if (formType === "modificar" && selectedService) {
        const serviceDoc = doc(db, 'Services', selectedService.id);
        await updateDoc(serviceDoc, {
          name: name.value,
          description: description.value,
          price: parseFloat(price.value),
          warranty: warranty.value,
          characteristics: characteristics.value,
          images: imageUrls
        });
      }

      setIsFormVisible(false);
      // Recargar la lista de servicios
      const servicesCollection = collection(db, 'Services');
      const snapshot = await getDocs(servicesCollection);
      const servicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesList);
    } catch (error) {
      setUploading(false);
      console.error("Error handling form submit: ", error);
    }
  };

  return (
    <div className="mantenimiento">
      <h1 id="mantenimientoservicio">Mantenimiento de Servicios</h1>
      <button className="btn-create" onClick={handleCreate}>Crear Nuevo Servicio</button>
      <button className="btn-create" onClick={handleReport}>Reporte</button>
      <button className="btn-create" onClick={handleContactar}>Por Contactar</button>



      <div className="services-list">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <img src={service.images[0] || '/placeholder-image.png'} alt={service.name} className="service-image" />
            <div className="service-info">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <p><strong>Precio:</strong> ${service.price.toFixed(2)}</p>
             {/* <p><strong>Garantía:</strong> {service.warranty || 'No especificado'}</p>
              <p><strong>Características:</strong> {service.characteristics || 'No especificadas'}</p>*/}
              <button className="btn-edit" onClick={() => handleEdit(service)}>Modificar</button>
              <button className="btn-delete" onClick={() => handleDelete(service.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isFormVisible}
        onRequestClose={() => setIsFormVisible(false)}
        contentLabel="Formulario de Servicio"
        className="modal"
        overlayClassName="overlay"
      >
        <form className="service-form" onSubmit={handleFormSubmit}>
          <h2>{formType === "crear" ? "Crear Servicio" : "Modificar Servicio"}</h2>
          <input
            name="name"
            placeholder="Nombre"
            value={formFields.name}
            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
            required
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={formFields.description}
            onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
            required
          />
          <input
            name="price"
            placeholder="Precio"
            type="number"
            step="0.01"
            value={formFields.price}
            onChange={(e) => setFormFields({ ...formFields, price: e.target.value })}
            required
          />
          <input
            name="warranty"
            placeholder="Garantía"
            value={formFields.warranty}
            onChange={(e) => setFormFields({ ...formFields, warranty: e.target.value })}
          />
          <textarea
            name="characteristics"
            placeholder="Características"
            value={formFields.characteristics}
            onChange={(e) => setFormFields({ ...formFields, characteristics: e.target.value })}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <button type="submit" disabled={uploading}>{formType === "crear" ? "Crear" : "Modificar"}</button>
          <button type="button" className="btn-cancel" onClick={() => setIsFormVisible(false)}>Cancelar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Mantenimiento;
