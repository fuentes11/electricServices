import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { SectionHeading } from "../misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "../misc/Buttons";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import { db, storage } from '../../data/firebase'; 
import { collection, getDocs, query, where, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Container = tw.div`relative w-full`;
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
  ${tw`mt-4 sm:mt-0 rounded-full p-3 text-[#333] bg-[#fdb86ab9]`}
  
  svg {
    ${tw`w-6 h-6`}
  }
`;
const PrevButton = styled(ControlButton)``;
const NextButton = styled(ControlButton)``;



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
  ${tw`w-full h-80 object-cover rounded-lg`}
`;

const TextInfo = tw.div`py-6 px-4`;
const TitleReviewContainer = tw.div`flex flex-col sm:flex-row sm:justify-between sm:items-center`;
const Title = tw.h5`text-4xl font-bold`;

const Description = tw.p`text-xl leading-loose mt-2 sm:mt-4`;

const ButtonContainer = tw.div`flex justify-between mt-4`;

const PrimaryButton = styled(PrimaryButtonBase)`
  ${tw`text-xl rounded-lg py-4 text-[#333] bg-[#fdb86ab9]`} 
  &:hover {
    ${tw`bg-[#fdb86a] text-white`}
  }
`;

const ModalBackdrop = tw.div`fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-40`;
const ModalContent = styled.div`
  ${tw`bg-white p-8 rounded-lg shadow-lg max-w-lg w-full relative`}
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalHeader = tw.div`flex justify-between items-center mb-4`;
const ModalBody = tw.div`space-y-6`;
const ModalFooter = tw.div`flex justify-end mt-4`;

const Input = tw.input`w-full p-2 border border-gray-300 rounded-md `;
const TextArea = tw.textarea`w-full p-2 border border-gray-300 rounded-md`;
const Label = tw.label`block text-xl font-medium text-gray-700`; // Cambiado a text-xl para un tamaño más grande

const FileInput = styled.input`
  ${tw`w-full py-2 border border-gray-300 rounded-md`}
`;

const Button = styled.button`
  ${tw`bg-[#fdb86ab9] font-bold text-[#333] py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 `}
`;

export const Mantenimiento = () => {
  const [sliderRef, setSliderRef] = useState(null);
  const [cards, setCards] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '' });
  const [editService, setEditService] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
        }
      },
    ]
  };

  const fetchServices = async () => {
    try {
      const servicesCollection = collection(db, "Services");
      const q = query(servicesCollection, where("activo", "==", 1)); 
      const servicesSnapshot = await getDocs(q);
      const servicesList = servicesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const image = data.image || ""; // Cambiado a "image"
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

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (service) => {
    setEditService(service);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setNewService({ name: '', description: '' });
    setEditService(null);
    setImageFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditModalOpen) {
      setEditService((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewService((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadFile = async (file, folder) => {
    try {
      const fileRef = ref(storage, `${folder}/${file.name}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "images");
      } else if (isEditModalOpen && editService) {
        imageUrl = editService.image; // Conservar la imagen existente
      }

      if (isAddModalOpen) {
        await addDoc(collection(db, "Services"), {
          name: newService.name,
          description: newService.description,
          image: imageUrl, // Cambiado a "image"
          activo: 1,
        });
      } else if (isEditModalOpen && editService) {
        const serviceDoc = doc(db, "Services", editService.id);
        await updateDoc(serviceDoc, {
          name: editService.name,
          description: editService.description,
          image: imageUrl, // Cambiado a "image"
        });
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setNewService({ name: '', description: '' });
      setEditService(null);
      setImageFile(null);

      const servicesCollection = collection(db, "Services");
      const snapshot = await getDocs(servicesCollection);
      const servicesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(servicesList);
    } catch (error) {
      console.error("Error handling form submit: ", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      const serviceDoc = doc(db, "Services", id);
      await deleteDoc(serviceDoc);
      const clicksCollection = collection(db, "Clicks");
      const q = query(clicksCollection, where("serviceId", "==", id));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (docSnapshot) => {
        const clickDoc = doc(db, "Clicks", docSnapshot.id);
        await updateDoc(clickDoc, {
          activo: 0,
        });
      });
      setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    } catch (error) {
      console.error("Error deleting service: ", error);
    }
  };

  return (
    <Container>
      <Content>
        <HeadingWithControl>
          <Heading>Servicios</Heading>
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
            <CardImage src={card.image} alt={card.title} />
            <TextInfo>
                <TitleReviewContainer>
                  <Title>{card.name}</Title>
                </TitleReviewContainer>
                <Description>{card.description}</Description>
                <ButtonContainer>
                  <PrimaryButton onClick={() => handleEditClick(card)}>
                    Editar
                  </PrimaryButton>
                  <PrimaryButton onClick={() => handleDeleteClick(card.id)}>Eliminar</PrimaryButton>
                </ButtonContainer>
              </TextInfo>
            </Card>
          ))}
        </CardSlider>
        <PrimaryButton onClick={handleAddClick}>Agregar Servicio</PrimaryButton>

        {(isAddModalOpen || isEditModalOpen) && (
          <ModalBackdrop>
            <ModalContent>
              <ModalHeader>
                <h2>{isAddModalOpen ? "Agregar Servicio" : "Editar Servicio"}</h2>
                <Button onClick={handleModalClose}>x</Button>
              </ModalHeader>
              <form onSubmit={handleFormSubmit}>
                <ModalBody>
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      name="name"
                      value={isEditModalOpen ? editService.name : newService.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <TextArea
                      id="description"
                      name="description"
                      value={isEditModalOpen ? editService.description : newService.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="images">Imagen (dejar vacío para conservar la existente)</Label>
                    <FileInput
                      type="file"
                      id="images"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Subiendo..." : "Guardar"}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalBackdrop>
        )}
      </Content>
    </Container>
  );
};
