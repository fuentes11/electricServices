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
          <p>Teléfono: +503 7640 7144</p>
          <p>Correo: servielectric-ventas@hotmail.com</p>
        </div>
        <div className="footer-section social-section">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TbBrandFacebook className="social-icon" />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TbBrandInstagram className="social-icon" />
            </a>
          </div>
        </div>
        <div className="footer-section logo-section">
          <h4>Sobre Nosotros</h4>
          <p>
            En Servielectric-sv, nos dedicamos a ofrecer soluciones eléctricas
            seguras y eficientes con un toque personal. Con años de experiencia
            y un equipo altamente capacitado, nos enorgullece ayudar a nuestros
            clientes a mantener sus hogares y negocios en funcionamiento.
            Valoramos la calidad, la seguridad y la honestidad en todo lo que
            hacemos. Confía en nosotros para tus necesidades eléctricas, estamos
            aquí para servirte con profesionalismo y dedicación.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
