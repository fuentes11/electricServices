import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Contexts/CartContext"; // Importa el contexto
import "../Header.css";
import cartIcon from "../assets/shopping-cart2.png";
import { GiShoppingCart } from "react-icons/gi";

const Header = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart(); // Obtén el conteo de artículos en el carrito

  const handleTitleClick = () => {
    navigate("/");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-item title" onClick={handleTitleClick}>
          Servielectric-sv
        </div>
        {/* buscador   
     <div className="header-item">
          <input type="text" placeholder="Buscar..." className="search-bar" />
        </div>
      */}
        <div className="header-item">
          <span className="cart-icon" onClick={handleCartClick}>
            <GiShoppingCart className="cart-image" />
            <span className="cart-count">{getCartCount()}</span>{" "}
            {/* Muestra el contador */}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
