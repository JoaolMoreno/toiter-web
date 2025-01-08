import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import ReactCrop, { Crop, PercentCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useDropzone } from 'react-dropzone';
import 'react-image-crop/dist/ReactCrop.css';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  type: 'profile' | 'header';
  currentImage?: string;
}

export const EditImageModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  currentImage,
}: EditImageModalProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aspectRatio = type === 'profile' ? 1 : 3;

  useEffect(() => {
    if (!isOpen) {
      setImage(null);
      setCrop(undefined);
    }
  }, [isOpen]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement;
  
    const { width, height, naturalWidth, naturalHeight } = img;
  
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
  
  
    setCrop(initialCrop);
  }
  
  const handleCropChange = (crop: Crop, percentCrop: PercentCrop) => {
    setCrop(crop);
};

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': [],
    },
    multiple: false,
  });

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<File> => {
    return new Promise((resolve, reject) => {
      const normalizedCrop = crop.unit === 'px' ? {
        unit: '%',
        x: (crop.x / image.width) * 100,
        y: (crop.y / image.height) * 100,
        width: (crop.width / image.width) * 100,
        height: (crop.height / image.height) * 100
      } : crop;

      const safeCrop = {
        x: Math.max(0, Math.min(100, normalizedCrop.x)),
        y: Math.max(0, Math.min(100, normalizedCrop.y)),
        width: Math.max(0, Math.min(100 - normalizedCrop.x, normalizedCrop.width)),
        height: Math.max(0, Math.min(100 - normalizedCrop.y, normalizedCrop.height))
      };
  
      const pixelCrop = {
        x: Math.round((safeCrop.x * image.naturalWidth) / 100),
        y: Math.round((safeCrop.y * image.naturalHeight) / 100),
        width: Math.round((safeCrop.width * image.naturalWidth) / 100),
        height: Math.round((safeCrop.height * image.naturalHeight) / 100)
      };  
  
      if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
        reject(new Error('Invalid crop dimensions'));
        return;
      }
  
      const canvas = document.createElement('canvas');
      
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }
  
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
  
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
  
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], 'cropped-image.jpeg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSubmit = async () => {
    if (!imageRef.current || !crop) return;
    try {
      setIsSubmitting(true);
  
      const croppedFile = await getCroppedImg(imageRef.current, crop);
      
      await onSubmit(croppedFile);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer hasImage={!!image}>
        <Header>
          <Title>Editar {type === 'profile' ? 'Foto de Perfil' : 'Capa'}</Title>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </Header>

        <Content hasImage={!!image}>
          {/* Área do Dropzone (substitui o input nativo) */}
          {!image && (
            <DropzoneArea {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <DropzoneText>Solte a imagem aqui...</DropzoneText>
              ) : (
                <DropzoneText>Clique ou arraste a imagem aqui</DropzoneText>
              )}
            </DropzoneArea>
          )}

          {/* Se já temos uma imagem selecionada, exibe o crop */}
          {image && (
            <CropContainer>
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                aspect={aspectRatio}
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              >
                <img
                  ref={imageRef}
                  src={image}
                  onLoad={handleImageLoad}
                  alt="Preview"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxHeight: '60vh',
                    maxWidth: '100%',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                />
              </ReactCrop>
            </CropContainer>
          )}
        </Content>

        <ButtonGroup>
          <CancelButton onClick={onClose}>Cancelar</CancelButton>
          <SaveButton onClick={handleSubmit} disabled={!image || isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </SaveButton>
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

const ModalContainer = styled.div<{ hasImage: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 12px;
  width: 90vw;
  max-width: 500px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: auto;
  max-height: ${({ hasImage }) => (hasImage ? '90vh' : 'auto')};
  overflow: visible;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;
  cursor: pointer;
`;

const Content = styled.div<{ hasImage: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: ${({ hasImage }) => (hasImage ? 'flex-start' : 'center')};
  max-height: 100%;
  overflow: visible;
`;

const DropzoneArea = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
`;

const DropzoneText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CropContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  & > div {
    width: auto !important;
    height: auto !important;
  }
  
  .ReactCrop__image {
    max-height: 60vh;
    width: auto;
    height: auto;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: #ff4d4f;
  border: none;
  color: white;

  &:hover {
    background-color: #ff7875;
  }
`;

const SaveButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;
