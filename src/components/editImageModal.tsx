import React, { useState } from 'react';
import styled from 'styled-components';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  type: 'profile' | 'header';
  currentImage?: string;
}

interface PreviewContainerProps {
  type: 'profile' | 'header';
}

export const EditImageModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  currentImage
}: EditImageModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string>();
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: type === 'profile' ? 100 : 56.25,
    x: 0,
    y: 0
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 500;
          const maxHeight = 500;
          let width = img.width;
          let height = img.height;
  
          // Ajustar dimensões para respeitar os limites
          if (width > maxWidth || height > maxHeight) {
            const scaleFactor = Math.min(maxWidth / width, maxHeight / height);
            width = width * scaleFactor;
            height = height * scaleFactor;
          }
  
          // Redimensionar imagem usando um canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
  
          // Converter canvas de volta para URL de imagem
          const resizedImage = canvas.toDataURL('image/jpeg');
          setPreview(resizedImage);
  
          // Atualizar o recorte
          setCrop({
            unit: '%',
            width: 100,
            height: type === 'profile' ? 100 : 56.25,
            x: 0,
            y: 0,
          });
        };
        img.src = reader.result as string;
      };
  
      reader.readAsDataURL(file);
    }
  };  

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (preview) {
        const croppedImage = await getCroppedImg(preview, crop);
        await onSubmit(croppedImage);
        onClose();
      }
    } catch (error) {
      console.error('Error updating image:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCroppedImg = async (imageSrc: string, crop: Crop): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = crop.width as number;
    canvas.height = crop.height as number;

    ctx.drawImage(
      image,
      crop.x as number,
      crop.y as number,
      crop.width as number,
      crop.height as number,
      0,
      0,
      crop.width as number,
      crop.height as number
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
        }
      }, 'image/jpeg');
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', reject);
      image.src = url;
    });

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <Title>Editar {type === 'profile' ? 'Foto de Perfil' : 'Capa'}</Title>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </Header>

        <Form>
          <ImageInput
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            id="image-input"
          />
          <ImageLabel htmlFor="image-input">
            Escolher imagem
          </ImageLabel>
          
          {preview && (
            <PreviewContainer type={type}>
              <ReactCrop
                crop={crop}
                onChange={newCrop => setCrop(newCrop)}
                aspect={type === 'profile' ? 1 : 16/9}
              >
                <PreviewImage src={preview} alt="Preview" />
              </ReactCrop>
            </PreviewContainer>
          )}
        </Form>
        <ButtonGroup>
            <CancelButton onClick={onClose}>Cancelar</CancelButton>
            <SaveButton onClick={handleSubmit}>Salvar</SaveButton>
          </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  width: 90vw;
  max-width: 450px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    width: 50vw;
  }

  @media (min-width: 1024px) {
    width: 40vw;
    max-width: 600px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ImageInput = styled.input`
  display: none;
`;

const ImageLabel = styled.label`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const PreviewContainer = styled.div<PreviewContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-height: 500px; // Limita a altura máxima para telas grandes
  aspect-ratio: ${({ type }) => (type === 'profile' ? '1' : '16/9')};
`;

const PreviewImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; // Ajuste para evitar overflow
  margin: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundElevated};
  }
`;

const SaveButton = styled(Button)<{ $isLoading?: boolean }>`
  background-color: ${({ theme, $isLoading }) => 
    $isLoading ? theme.colors.secondary : theme.colors.primary};
  border: none;
  color: white;
  pointer-events: ${props => props.$isLoading ? 'none' : 'auto'};
  opacity: ${props => props.$isLoading ? 0.7 : 1};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;