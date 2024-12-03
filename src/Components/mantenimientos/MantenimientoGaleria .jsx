import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { db, storage } from "../../data/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { SectionHeading } from "../misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "../misc/Buttons";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";

// Estilos usando Twin.macro
const Container = tw.div`relative bg-[#faf6ea] w-full`;
const Content = tw.div`max-w-screen-xl mx-auto py-16 lg:py-20 px-4`;

const HeadingWithControl = styled.div`
  ${tw`flex flex-col items-center sm:items-stretch sm:flex-row justify-between relative z-30 pt-16`}
`;
const Heading = styled(SectionHeading)`
  ${tw`z-20`}
`;

const Controls = styled.div`
  ${tw`flex items-center z-30 absolute top-0 mt-40 w-full justify-between px-4`}
`;

const ControlButton = styled(PrimaryButtonBase)`
  ${tw`rounded-full p-3 text-[#333] bg-[#fdb86ab9]`}

  svg {
    ${tw`w-6 h-6`}
  }
`;

const PrevButton = styled(ControlButton)`
  ${tw`mr-2`}/* Ajusta el margen derecho para que el botón no se pegue al borde */
`;

const NextButton = styled(ControlButton)`
  ${tw`ml-2`}/* Ajusta el margen izquierdo para que el botón no se pegue al borde */
`;

const CardSlider = styled(Slider)`
  ${tw`mt-16 relative z-10`}

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
  ${tw`w-full h-72 object-cover rounded-lg`}
`;

const TextInfo = tw.div`py-6 px-4 w-full`;
const TitleReviewContainer = tw.div`flex flex-col sm:flex-row sm:justify-between sm:items-center w-full`;
const Title = tw.h5`text-4xl font-bold`;

const ButtonContainer = tw.div`flex justify-between mt-4 w-full`;

const PrimaryButton = styled(PrimaryButtonBase)`
  ${tw`text-xl rounded-lg py-4 text-[#333] bg-[#fdb86ab9] shadow-md w-full`}

  &:hover {
    ${tw`bg-[#fdb86a] text-white`}
  }
`;

const ModalOverlay = tw.div`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40`;
const ModalContent = styled.div`
  ${tw`bg-white p-6 rounded-lg relative`}
  width: 600px;
  max-width: 90vw;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = tw.h2`text-2xl font-bold mb-4`;

const Label = tw.label`block text-lg font-medium text-gray-700 mb-2`;
const Input = tw.input`border border-gray-300 rounded-lg p-2 w-full mb-4`;
const FileInput = tw.input`block w-full mb-4`;

const Button = tw.button`bg-[#fdb86a] text-[#333] font-bold py-2 px-4 rounded-lg hover:bg-blue-600`;

export const MantenimientoGaleria = () => {
  const [sliderRef, setSliderRef] = useState(null);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(""); // "crear" o "modificar"
  const [selectedItem, setSelectedItem] = useState(null);
  const [title, setTitle] = useState("");
  const [largeImage, setLargeImage] = useState(null);
  const [smallImage, setSmallImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  const sliderSettings = {
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: false,
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
    const fetchGalleryItems = async () => {
      try {
        const galleryCollection = collection(db, "Galeria");
        const q = query(galleryCollection, where("activo", "==", 1));
        const gallerySnapshot = await getDocs(q);
        const galleryItems = gallerySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            largeImage: data.largeImage,
            smallImage: data.smallImage,
            video: data.video,
          };
        });
        setCards(galleryItems);
      } catch (error) {
        console.error("Error fetching gallery items: ", error);
      }
    };

    fetchGalleryItems();
  }, []);

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleAdd = () => {
    setFormType("crear");
    setTitle("");
    setLargeImage(null);
    setSmallImage(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormType("modificar");
    setSelectedItem(item);
    setTitle(item.title);
    setLargeImage(null); // Si no se selecciona una nueva imagen, se mantiene la anterior
    setSmallImage(null); // Si no se selecciona una nueva imagen, se mantiene la anterior
    setVideo(null); // Si no se selecciona un nuevo video, se mantiene el anterior

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "Galeria", id));
      // Re-fetch data
      const galleryCollection = collection(db, "Galeria");
      const q = query(galleryCollection, where("activo", "==", 1));
      const gallerySnapshot = await getDocs(q);
      const galleryItems = gallerySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          largeImage: data.largeImage,
          smallImage: data.smallImage,
          video: data.video,
        };
      });
      setCards(galleryItems);
    } catch (error) {
      console.error("Error deleting gallery item: ", error);
    }
  };
  const handleClose = () => {
    setShowModal(false);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setShowLoader(true);

      let largeImageUrl = "";
      let smallImageUrl = "";
      let videoUrl = "";
      let currentItem = null;

      if (formType === "modificar" && selectedItem) {
        const docRef = doc(db, "Galeria", selectedItem.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          currentItem = docSnap.data();
        }
      }
      // Subir el video como entrada separada si existe
      if (video) {
        const videoRef = ref(storage, `galeria/video-${video.name}`);
        await uploadBytes(videoRef, video);
        videoUrl = await getDownloadURL(videoRef);

        const videoData = {
          title,
          largeImage: "", // Aseguramos que las imágenes no se mantengan
          smallImage: "",
          video: videoUrl,
          activo: 1,
        };

        // Crear entrada separada para el video
        if (formType === "crear") {
          await addDoc(collection(db, "Galeria"), videoData);
        } else if (formType === "modificar" && selectedItem) {
          // Si existe un video, se actualiza el documento eliminando las imágenes
          await updateDoc(doc(db, "Galeria", selectedItem.id), videoData);
        }
      }

      // Subir imágenes si están presentes
      if (largeImage || smallImage) {
        if (largeImage) {
          const largeImageRef = ref(
            storage,
            `galeria/large-${largeImage.name}`
          );
          await uploadBytes(largeImageRef, largeImage);
          largeImageUrl = await getDownloadURL(largeImageRef);
        } else if (formType === "modificar" && selectedItem) {
          largeImageUrl = selectedItem.largeImage;
        }

        if (smallImage) {
          const smallImageRef = ref(
            storage,
            `galeria/small-${smallImage.name}`
          );
          await uploadBytes(smallImageRef, smallImage);
          smallImageUrl = await getDownloadURL(smallImageRef);
        } else if (formType === "modificar" && selectedItem) {
          smallImageUrl = selectedItem.smallImage;
        }

        // Crear o actualizar entrada para las imágenes
        const imgData = {
          title,
          largeImage: largeImageUrl,
          smallImage: smallImageUrl,
          video: "", // Aseguramos que el video no se mantenga
          activo: 1,
        };

        if (formType === "crear") {
          await addDoc(collection(db, "Galeria"), imgData);
        } else if (formType === "modificar" && selectedItem) {
          await updateDoc(doc(db, "Galeria", selectedItem.id), imgData);
        }
      }

      if (!video && !largeImage && !smallImage) {
        const data = {
          title,
          largeImage: currentItem ? currentItem.largeImage : "",
          smallImage: currentItem ? currentItem.smallImage : "",
          video: currentItem ? currentItem.video : "",
          activo: 1,
        };

        if (formType === "crear") {
          await addDoc(collection(db, "Galeria"), data);
        } else if (formType === "modificar" && selectedItem) {
          await updateDoc(doc(db, "Galeria", selectedItem.id), data);
        }
      }
      setShowLoader(false);
      setShowModal(false);
      // Re-fetch data
      const galleryCollection = collection(db, "Galeria");
      const q = query(galleryCollection, where("activo", "==", 1));
      const gallerySnapshot = await getDocs(q);
      const galleryItems = gallerySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          largeImage: data.largeImage,
          smallImage: data.smallImage,
          video: data.video,
        };
      });
      setCards(galleryItems);
    } catch (error) {
      console.error("Error saving gallery : ", error);
      alert("ups algo paso comunicate con el encargado");
    }
  };

  return (
    <Container>
      <Content>
        <HeadingWithControl>
          <Heading>Mantenimiento Galería</Heading>
          <Controls>
            <PrevButton onClick={() => sliderRef.slickPrev()}>
              <ChevronLeftIcon />
            </PrevButton>
            <NextButton onClick={() => sliderRef.slickNext()}>
              <ChevronRightIcon />
            </NextButton>
          </Controls>
        </HeadingWithControl>

        <CardSlider ref={setSliderRef} {...sliderSettings}>
          {cards.map((card) => (
            <Card key={card.id}>
              {card.smallImage && (
                <CardImage src={card.smallImage} alt={card.title} />
              )}
              {card.video && (
                <div>
                  <video style={{ width: "100%", height: "60%" }} controls>
                    <source src={card.video} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              )}
              <TextInfo>
                <TitleReviewContainer>
                  <Title>{card.title}</Title>
                </TitleReviewContainer>
                <ButtonContainer>
                  <PrimaryButton onClick={() => handleEdit(card)}>
                    Editar
                  </PrimaryButton>
                  <PrimaryButton onClick={() => handleDelete(card.id)}>
                    Eliminar
                  </PrimaryButton>
                </ButtonContainer>
              </TextInfo>
            </Card>
          ))}
        </CardSlider>

        {showModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>
                {formType === "crear"
                  ? "Agregar Servicio"
                  : "Modificar Servicio"}
              </ModalTitle>
              <form onSubmit={handleSubmit}>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Label htmlFor="largeImage">Imagen Grande</Label>
                <FileInput
                  id="largeImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setLargeImage)}
                />
                <Label htmlFor="smallImage">Imagen Pequeña</Label>
                <FileInput
                  id="smallImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setSmallImage)}
                />
                <Label htmlFor="video">Video</Label>
                <FileInput
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, setVideo)}
                />
                <Button type="submit">
                  {showLoader ? "Enviando..." : "Guardar"}
                </Button>
                <Button onClick={handleClose}>Cerrar</Button>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
        <PrimaryButton onClick={handleAdd}>Agregar Nueva imagen</PrimaryButton>
      </Content>
    </Container>
  );
};
