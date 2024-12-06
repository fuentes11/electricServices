import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { SectionHeading } from "./misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "./misc/Buttons";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import { db } from "../data/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import Modal from "react-modal";
import { CiMail } from "react-icons/ci";
import { IoLogoWhatsapp } from "react-icons/io";

const Container = tw.div`relative`;
const Content = tw.div`max-w-screen-xl mx-auto py-16 lg:py-20 px-4`;

const HeadingWithControl = tw.div`flex flex-col items-center sm:items-stretch sm:flex-row justify-between relative z-30 pt-16`;

const Heading = styled(SectionHeading)`
  ${tw`z-20`}
`;

const Controls = tw.div`flex items-center z-30 absolute top-0 mt-40 w-full justify-between px-4`;

const ControlButton = styled(PrimaryButtonBase)`
  ${tw`mt-4 sm:mt-0 rounded-full p-3 text-[#333] bg-[#fdb86ab9]`}

  svg {
    ${tw`w-6 h-6`}
  }
`;

const PrevButton = tw(ControlButton)``;
const NextButton = tw(ControlButton)``;

const CardSlider = styled(Slider)`
  ${tw`mt-16`}
  .slick-track {
    ${tw`flex`}
  }
  .slick-slide {
    ${tw`flex justify-center`}
  }
  .slick-slide > div {
    ${tw`flex justify-center`}
  }
  .slick-list {
    ${tw`overflow-hidden`}
  }
`;

const Card = tw.div`flex flex-col border max-w-lg h-full rounded-lg relative focus:outline-none`;
const CardImage = styled.img`
  ${tw`w-full h-80 object-cover rounded-lg`}
`;

const TextInfo = tw.div`py-6 px-2`;
const TitleReviewContainer = tw.div`flex flex-col sm:flex-row sm:justify-between sm:items-center`;
const Title = tw.h5`text-4xl font-bold`;

const Description = tw.p`text-xl leading-loose mt-2 sm:mt-4`;

const PrimaryButton = tw(PrimaryButtonBase)`
  mt-auto
  sm:text-xl
  rounded-none
  w-full
  rounded-lg
  py-4
  text-[#333]
  bg-[#fdb86ab9]
`;

const ModalContent = styled.div`
  ${tw`bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-20`}
  h2 {
    ${tw`text-xl font-bold mb-4 text-gray-800`}
  }
  p {
    ${tw`mb-4 text-gray-700`}
  }
  .form-buttons {
    ${tw`flex flex-col space-y-4 mt-4`}
    button {
      ${tw`w-full py-2 px-4 rounded-lg text-white font-semibold`}
      &.submit {
        ${tw`bg-[#fdb86ab9] text-[#333] hover:bg-blue-600 flex items-center justify-center space-x-2`}
      }
      &.cancel {
        ${tw`bg-gray-500 text-[#333] hover:bg-gray-600`}
      }
    }
  }
`;

export const Services = () => {
  const [sliderRef, setSliderRef] = useState(null);
  const [cards, setCards] = useState([]);
  const [consultModalIsOpen, setConsultModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [contactModalIsOpen, setContactModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    otro: "",
    direccion: "",
    serviceName: "", // Nuevo campo para el nombre del servicio
    activo: 1,
  });
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);

  const sliderSettings = {
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, "Services");
        const q = query(servicesCollection, where("activo", "==", 1));
        const servicesSnapshot = await getDocs(q);
        const servicesList = servicesSnapshot.docs.map((doc) => {
          const data = doc.data();
          const image = data.image && data.image.length > 0 ? data.image : "";
          return {
            id: doc.id,
            name: data.name,
            image: image,
            description: data.description,
          };
        });
        setCards(servicesList);
      } catch (error) {
        console.error("Error fetching services: ", error);
      }
    };

    fetchServices();
  }, []);

  const handleMoreInfo = async (id, name) => {
    try {
      const clicksCollection = collection(db, "Clicks");
      await addDoc(clicksCollection, {
        serviceId: id,
        serviceName: name,
        clickDate: Timestamp.fromDate(new Date()),
        activo: 1,
      });
    } catch (error) {
      console.error("Error registering click: ", error);
    }
    setSelectedService({ id, name });
  };

  const handleWhatsAppConsult = () => {
    if (!selectedService) return;
    const message = `Hola me gustaria realizar una cotizacion sobre este servicio:\n\nServicio: ${selectedService.name}`;
    window.location.href = `https://wa.me/+50374819876?text=${encodeURIComponent(
      message
    )}`;
  };

  const handleEmailConsult = () => {
    if (!selectedService) return;
    const emailBody = encodeURIComponent(
      `Hola me gustaria realizar una cotizacion sobre este servicio:\n\nServicio: ${selectedService.name}`
    );
    window.location.href = `mailto:jasonfuentes3025@gmail.com?subject=Consulta de Servicio&body=${emailBody}`;
  };

  const handleConsult = () => {
    setConsultModalIsOpen(true);
  };

  const closeModal = () => {
    setConsultModalIsOpen(false);
    setContactModalIsOpen(false);
    setShowLoader(false);
  };

  const handleContactConsult = () => {
    setFormData({ ...formData, serviceName: selectedService.name }); // Añadir el nombre del servicio al formData
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
      await addDoc(collection(db, "Contactar"), formData); // Enviar formData con el nombre del servicio incluido
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
          direccion: "",
          serviceName: "", // Resetea el nombre del servicio también
          activo: 1,
        });
      }, 2000);
    } catch (error) {
      console.error("Error al agregar documento: ", error);
      setShowLoader(false);
    }
  };

  return (
    <Container id="services">
      <Content>
        <HeadingWithControl>
          <Heading>Nuestros Servicios</Heading>
          <Controls>
            <PrevButton onClick={sliderRef?.slickPrev}>
              <ChevronLeftIcon />
            </PrevButton>
            <NextButton onClick={sliderRef?.slickNext}>
              <ChevronRightIcon />
            </NextButton>
          </Controls>
        </HeadingWithControl>
        <CardSlider ref={setSliderRef} {...sliderSettings}>
          {cards.map((card, index) => (
            <Card key={index}>
              <CardImage src={card.image} alt={card.title} />
              <TextInfo>
                <TitleReviewContainer>
                  <Title>{card.name}</Title>
                </TitleReviewContainer>
                <Description>{card.description}</Description>
              </TextInfo>
              <PrimaryButton
                onClick={() => {
                  handleConsult();
                  handleMoreInfo(card.id, card.name);
                }}
              >
                Cotizar
              </PrimaryButton>
            </Card>
          ))}
        </CardSlider>
      </Content>

      {/* Modal de Consulta */}
      <Modal
        isOpen={consultModalIsOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
          },
          content: {
            position: "absolute",
            inset: "40px",
            border: "none",
            background: "transparent",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "10px",
            outline: "none",
            padding: "0px",
            maxWidth: "500px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <ModalContent>
          <h2>Selecciona un método de consulta:</h2>
          <div className="form-buttons">
            <button className="submit" onClick={handleEmailConsult}>
              <CiMail size={22} /> Consultar por Email
            </button>
            <button className="submit" onClick={handleWhatsAppConsult}>
              <IoLogoWhatsapp size={22} /> Consultar por WhatsApp
            </button>
            <button className="submit" onClick={handleContactConsult}>
              ¿Deseas que te contactemos?
            </button>
            <button className="cancel" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </ModalContent>
      </Modal>

      {/* Modal de Contacto */}
      <Modal
        isOpen={contactModalIsOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
          },
          content: {
            position: "absolute",
            inset: "40px",
            border: "none",
            background: "transparent",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "10px",
            outline: "none",
            padding: "0px",
            maxWidth: "500px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <ModalContent>
          <h2 className="modal-title">Contacta a nuestro equipo</h2>
          <form className="review-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="correo"
              placeholder="Correo"
              value={formData.correo}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="direccion (opcional)"
              value={formData.direccion}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="otro"
              placeholder="Detalles adicionales (opcional)"
              value={formData.otro}
              onChange={handleInputChange}
            ></textarea>
            <PrimaryButton className="submit" type="submit">
              {showLoader ? "Enviando..." : "Enviar"}
            </PrimaryButton>
            {showThankYouMessage && <p>¡Gracias por contactarnos!</p>}
          </form>
          <button className="cancel" onClick={closeModal}>
            Cancelar
          </button>
        </ModalContent>
      </Modal>
    </Container>
  );
};
