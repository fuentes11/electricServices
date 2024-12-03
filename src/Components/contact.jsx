import { useState } from "react";
import React from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../data/firebase"; // Asegúrate de importar tu configuración de Firebase

const initialState = {
  nombre: "",
  apellido:"",
  correo: "",
  otro: "",
  telefono: "", 
  activo: 1, // Agrega el campo para teléfono si es necesario
};
export const Contact = (props) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviar la información a Firestore
      await addDoc(collection(db, "Contactar"), {
        nombre: formData.name,
        apellido:formData.apellido,
        correo: formData.email,
        telefono: formData.phone,
        otro: formData.message, 
        activo: 1// Mensaje como "otro"
      });
      setFormData(initialState);

      // Forzar una actualización (opcional, pero generalmente innecesario)
      window.location.reload(); 
      console.log("Documento agregado con éxito");

      // Limpiar el estado después de enviar
    } catch (error) {
      console.error("Error al agregar documento: ", error);
    }
  };
  return (
    <div>
      <div id="contact">
        <div className="container">
          <div className="col-md-8">
            <div className="row">
              <div className="section-title">
                <h2>Contactanos</h2>
                <p> 
                Por favor complete el siguiente formulario para enviarnos un correo electrónico y lo haremos
                  Responderemos a usted lo antes posible.
                </p>
              </div>
              <form name="sentMessage" validate onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        placeholder="Nombre"
                        required
                        onChange={handleChange}
                        
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        className="form-control"
                        placeholder="apellido"
                        required
                        onChange={handleChange}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        placeholder="Correo"
                        required
                        onChange={handleChange}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="number"
                        id="phone"
                        name="phone"
                        className="form-control"
                        placeholder="Telefono(opcional)"
                        onChange={handleChange}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    id="message"
                    className="form-control"
                    rows="4"
                    placeholder="Mensaje"
                    required
                    onChange={handleChange}
                  ></textarea>
                  <p className="help-block text-danger"></p>
                </div>
                
                <div id="success"></div>
                <button type="submit" className="btn btn-custom btn-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
          <div className="col-md-3 col-md-offset-1 contact-info">
            <div className="contact-item">
              <h3>Informacion de contacto</h3>
             
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-phone"></i> telefono
                </span>{" "}
                {props.data ? props.data.phone : "loading"}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-envelope-o"></i> correo
                </span>{" "}
                {props.data ? props.data.email : "loading"}
              </p>
            </div>
          </div>
          <div className="col-md-12" >
            <div className="row">
              <div className="social">
                <ul>
                  <li>
                    <a href={props.data ? props.data.facebook : "/"}>
                      <i className="fa fa-facebook"></i>
                    </a>
                  </li>
                  <li>
                    <a href={props.data ? props.data.instagram : "/"}>
                      <i className="fa fa-instagram"></i>
                    </a>
                  </li>
                  
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div id="footer">
        <div className="container text-center">
          <p>
            &copy; 2024 Servielectric-sv. Design by{" "}
            <a href="http://www.templatewire.com" rel="nofollow">
              Jason
            </a>
          </p>
        </div>
      </div>
      */}
    </div>
  );
};
