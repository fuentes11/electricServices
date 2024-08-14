import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Components/header";
import Footer from "./Components/Footer";
import ProductDetail from "./Components/ProductDetail";
import Home from "./Home";
import Cart from "./Components/Cart"; // Asegúrate de tener el componente de carrito
import Mantenimiento from "./Components/Mantenimiento"; 
import Reporte from "./Components/Reporte"; 
import Contactar from './Components/Contactar'; // Ajusta la ruta según tu estructura de archivos

import { CartProvider } from './Contexts/CartContext'; // Importa el contexto
import "./App.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/Mantenimiento" element={<Mantenimiento />} />
              <Route path="/Reporte" element={<Reporte />} />
              <Route path="/Contactar" element={<Contactar />} />


            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
