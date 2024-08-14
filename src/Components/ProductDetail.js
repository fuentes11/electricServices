import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../DB/DB";
import { useCart } from "../Contexts/CartContext";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("tab1");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = doc(db, "Services", id);
        const productSnapshot = await getDoc(productDoc);
        if (productSnapshot.exists()) {
          const productData = productSnapshot.data();
          console.log("Fetched product:", productData); // Verifica los datos del producto
          setProduct({ ...productData, id: productSnapshot.id }); // Añade el id del documento al producto
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product details: ", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddToCart = () => {
    if (product && product.id) {
      addToCart(product); // Utiliza la función addToCart del contexto
     // alert(`${product.name} ha sido agregado al carrito.`);
    } else {
      console.error("El producto no tiene un id definido.");
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="product-detail">
        <div className="carousel-container">
          <Carousel>
            {Array.isArray(product.images) ? (
              product.images.map((image, index) => (
                <div key={index}>
                  <img src={image} alt={`Vista del producto ${index + 1}`} />
                </div>
              ))
            ) : (
              <div>
                <img src={product.images} alt="Vista del producto" />
              </div>
            )}
          </Carousel>
        </div>

        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <h1 className="product-name">{product.description}</h1>
          <p className="product-price">${product.price}</p>
          <button className="add-to-cart" onClick={handleAddToCart}>
            Agregar al carrito
          </button>
        </div>
      </div>
      <div className="product-detail2">
        <div className="tabs-container">
          <div className="tabs">
            <button
              onClick={() => handleTabChange("tab1")}
              className={activeTab === "tab1" ? "active" : ""}
            >
              Descripción
            </button>
            <button
              onClick={() => handleTabChange("tab2")}
              className={activeTab === "tab2" ? "active" : ""}
            >
              Características
            </button>
            <button
              onClick={() => handleTabChange("tab3")}
              className={activeTab === "tab3" ? "active" : ""}
            >
              Garantía
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "tab1" && <p>{product.description}</p>}
            {activeTab === "tab2" && <p>{product.characteristics}</p>}
            {activeTab === "tab3" && <p>{product.warranty}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
