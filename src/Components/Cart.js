import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useCart } from "../Contexts/CartContext";
import "../Cart.css";
import { FaTrashAlt } from 'react-icons/fa';
import { CiMail } from 'react-icons/ci'; // Iconos para correo y WhatsApp
import { IoLogoWhatsapp } from "react-icons/io";
import { db } from "../DB/DB"; // Configuración de Firebase
import { collection, addDoc } from "firebase/firestore";

// Configura el contenedor del modal
Modal.setAppElement('#root');

const Cart = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [clearCartConfirm, setClearCartConfirm] = useState(false);
  const [consultModalIsOpen, setConsultModalIsOpen] = useState(false);
  const [contactModalIsOpen, setContactModalIsOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    otro: "",
    subtotal: 0,
    items: [], // Agregamos un arreglo para almacenar los ítems
    activo: 1
  });
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);

  // Función para calcular el subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // Actualiza el subtotal y los ítems en el estado
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      subtotal: calculateSubtotal(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: (item.price * item.quantity).toFixed(2)
      }))
    }));
  }, [cart]);

  const handleConsult = () => {
    setConsultModalIsOpen(true);
  };

  const openRemoveModal = (itemId) => {
    setItemToRemove(itemId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setConsultModalIsOpen(false);
    setContactModalIsOpen(false);
    setItemToRemove(null);
    setClearCartConfirm(false);
    setShowLoader(false);
    setShowThankYouMessage(false);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
    }
    closeModal();
  };

  const handleClearCart = () => {
    setClearCartConfirm(true);
    setModalIsOpen(true);
  };

  const handleConfirmClearCart = () => {
    clearCart();
    closeModal();
  };

  const handleEmailConsult = () => {
    const emailBody = encodeURIComponent(`Detalles del carrito:\n\n${cart.map(item => `${item.name} - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\nSubtotal: $${calculateSubtotal()}`);
    window.location.href = `mailto:peke3025@gmail.com?subject=Consulta de Carrito&body=${emailBody}`;
  };

  const handleWhatsAppConsult = () => {
    const message = `Detalles del carrito:\n\n${cart.map(item => `${item.name} - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`).join('%0A')}\n\nSubtotal: $${calculateSubtotal()}`;
    window.location.href = `https://wa.me/74819876?text=${encodeURIComponent(message)}`; // Reemplaza con tu número de WhatsApp
  };

  const handleContactConsult = () => {
    setContactModalIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setShowLoader(true);
      await addDoc(collection(db, "Contactar"), formData);
      setShowLoader(false);
      setShowThankYouMessage(true);
      setTimeout(() => {
        setShowThankYouMessage(false);
        closeModal();
        setFormData({
          nombre: "",
          apellido: "",
          telefono: "",
          correo: "",
          otro: "",
          subtotal: 0,
          items: [], // Reinicia el arreglo de ítems
          activo: 1
        });
        clearCart();

      }, 3000);
    } catch (error) {
      console.error("Error al agregar documento: ", error);
      setShowLoader(false);

    }
  };

  return (
    <div className="cart">
      <h1>Carrito de Servicios</h1>
      {cart.length === 0 ? (
        <p className="empty-message">Tu carrito está vacío</p>
      ) : (
        <div>
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.images[0] || '/default-image.jpg'} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <div className="cart-item-details">
                    <h2 className="cart-item-name">{item.name}</h2>
                    <p className="cart-item-description">{item.description}</p>
                    <p className="cart-item-price">Precio: ${item.price}</p>
                  </div>
                  <span className="quantity-label">Cantidad</span>
                  <div className="quantity-controls">
                    <button className="quantity-button" onClick={() => decreaseQuantity(item.id)}>-</button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button className="quantity-button" onClick={() => increaseQuantity(item.id)}>+</button>
                    <button className="remove-button" onClick={() => openRemoveModal(item.id)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <p className="subtotal-label">Subtotal: ${calculateSubtotal()}</p>
          </div>
          <div className="button-group">
            <button onClick={handleConsult} className="consult-button">Consultar</button>
            <button onClick={handleClearCart} className="clear-cart">Limpiar Carrito</button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>{clearCartConfirm ? "¿Estás seguro de que quieres limpiar todo el carrito?" : "¿Estás seguro de que quieres eliminar este ítem del carrito?"}</h2>
        <div className="modal-buttons">
          <button onClick={clearCartConfirm ? handleConfirmClearCart : handleConfirmRemove} className="confirm-button">Sí</button>
          <button onClick={closeModal} className="cancel-button">No</button>
        </div>
      </Modal>

      {/* Modal de Consulta */}
      <Modal
        isOpen={consultModalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>¿Cómo deseas consultar?</h2>
        <div className="consult-options">
          <button onClick={handleEmailConsult} className="consult-option">
            <CiMail className="consult-icon" />
            Correo
          </button>
          <button onClick={handleWhatsAppConsult} className="consult-option">
            <IoLogoWhatsapp className="consult-icon" />
            WhatsApp
          </button>
          <button onClick={handleContactConsult} className="consult-option">
            ¿Deseas que te contactemos?
          </button>
        </div>
      </Modal>

      {/* Modal de Contacto con Formulario */}
      <Modal
        isOpen={contactModalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2>Formulario de Contacto</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre:
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Apellido:
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Teléfono:
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Correo:
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Otros:
              <textarea
                name="otro"
                value={formData.otro}
                onChange={handleInputChange}
              />
            </label>
            <input type="hidden" name="subtotal" value={formData.subtotal} />
            <input type="hidden" name="items" value={JSON.stringify(formData.items)} /> {/* Agrega los ítems al formulario */}
            <div className="form-buttons">
              <button type="submit" className="submit-button">
                {showLoader ? "Enviando..." : "Enviar"}
              </button>
              <button onClick={closeModal} className="submit-button">
                Cancelar
              </button>
            </div>
          </form>
          {showThankYouMessage && <p className="thank-you-message">¡Gracias por tu consulta!</p>}
        </div>
      </Modal>
    </div>
  );
};

export default Cart;
