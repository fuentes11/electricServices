import React from "react";
import "../Footer.css";
import facebookIcon from "../assets/facebook-icon.png";
import instagramIcon from "../assets/instagram-icon.png";
import { TbBrandFacebook, TbBrandInstagram } from "react-icons/tb"; // Importa los íconos necesarios

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact-section">
          <h4>Contacto</h4>
          <p>Teléfono: +1 (123) 456-7890</p>
          <p>Correo: contacto@prueba.com</p>
          <p>Dirección: Calle Ejemplo 123, Ciudad, País</p>
        </div>
        <div className="footer-section social-section">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <TbBrandFacebook className="social-icon" />
            </a>
        
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <TbBrandInstagram className="social-icon" />
            </a>
          </div>
        </div>
        <div className="footer-section logo-section">
          <h4>Sobre Nosotros</h4>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
