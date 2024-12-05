import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigation } from "./Components/Navigation";
import { Header } from "./Components/header";
import { About } from "./Components/about";
import { Services } from "./Components/services";
import { Gallery } from "./Components/gallery";
import { Testimonials } from "./Components/testimonials";
import { Contact } from "./Components/contact";
import Mantenimiento from "./Components/mantenimientos/MantenimientoReporte"; // Asegúrate de tener este componente
import Login from "./Components/mantenimientos/Login"
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Header data={landingPageData.Header} />
              <About data={landingPageData.About} />
              <Services data={landingPageData.Services} />
              <Gallery data={landingPageData.Gallery} />
              <Testimonials data={landingPageData.Testimonials} />
              <Contact data={landingPageData.Contact} />
            </div>
          }
        />
        <Route path="/mantenimiento" element={<Login/>} />
        <Route path="/mantenimiento-reporte" element={<Mantenimiento />} />

      </Routes>
    </Router>
  );
};

export default App;
