// Dicom.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import cornerstoneMath from 'cornerstone-math';
import cornerstoneTools from 'cornerstone-tools';
import dicomParser from 'dicom-parser';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../assets/css/Dicom.css';
import ZoomIn from '../assets/icons/zoom-in.png';
import ZoomOut from '../assets/icons/zoom-out.png';
import Reset from '../assets/icons/reset.png';
import ContrastIcon from '../assets/icons/contrast.png'; // Cambié el nombre para evitar conflictos
import ContrastControl from './DicomConstrast';
import InvertIcon from '../assets/icons/invert-tool.png'


// Inicialización de loaders y configuración de Cornerstone
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = window.Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneWADOImageLoader.configure({
    useWebWorkers: true,
});

cornerstoneTools.init();

const Dicom = () => {
    
    const location = useLocation();
    const { paciente } = location.state || {}; 
    const [imageIds, setImageIds] = useState([]);
    const [dicomData, setDicomData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [currentView, setCurrentView] = useState('Coronal');
    const [loadingStatus, setLoadingStatus] = useState('');
    const [inverted, setInverted] = useState(false);
    const [volumeData, setVolumeData] = useState(null);
    const imageRef = useRef(null);
    const sliderRef = useRef(null);
    const isDraggingRef = useRef(false);

    const [sliceIndices, setSliceIndices] = useState({
        Sagital: 0,
        Coronal: 0,
        Axial: 0
    });

    const generateView = (type, sliceIndex) => {
        if (!volumeData) return null;
        
        const { data, dimensions } = volumeData;
        const { width, height, depth } = dimensions;
        
        switch(type) {
            case 'Coronal':
                const sagittalData = new Float32Array(height * depth);
                for (let y = 0; y < height; y++) {
                    for (let z = 0; z < depth; z++) {
                        sagittalData[y * depth + z] = data[z * width * height + y * width + sliceIndex];
                    }
                }
                return {
                    pixelData: sagittalData,
                    width: depth,
                    height: height
                };
                
            case 'Axial':
                const AxialData = new Float32Array(width * depth);
                for (let x = 0; x < width; x++) {
                    for (let z = 0; z < depth; z++) {
                        AxialData[z * width + x] = data[z * width * height + sliceIndex * width + x];
                    }
                }
                return {
                    pixelData: AxialData,
                    width: width,
                    height: depth
                };
            
            case 'Sagital':
            default:
                return null; // La vista Sagital se maneja directamente con la imagen DICOM
        }
    };

    const createCornerstoneImage = (viewData, type) => {
        if (!viewData) return null;
        
        const minPixelValue = Math.min(...viewData.pixelData);
        const maxPixelValue = Math.max(...viewData.pixelData);
        const windowCenter = (minPixelValue + maxPixelValue) / 2;
        const windowWidth = maxPixelValue - minPixelValue;

        return {
            imageId: `${type}_${Date.now()}`,
            minPixelValue,
            maxPixelValue,
            slope: 0.8,
            intercept: 0,
            windowCenter,
            windowWidth: windowWidth * 1,
            getPixelData: () => viewData.pixelData,
            rows: viewData.height,
            columns: viewData.width,
            height: viewData.height,
            width: viewData.width,
            color: false,
            columnPixelSpacing: volumeData.spacing?.x || 1,
            rowPixelSpacing: volumeData.spacing?.y || 1,
            sizeInBytes: viewData.pixelData.length * 4
        };
    };

    const onFolderChange = async (event) => {
        setLoadingStatus('Cargando archivos...');
        const files = Array.from(event.target.files);
        const dicomFiles = files.filter(file => file.name.toLowerCase().endsWith('.dcm'));
        
        if (dicomFiles.length === 0) {
            setLoadingStatus('No se encontraron archivos DICOM');
            return;
        }
    
        // Nos aseguramos de que los IDs sean strings
        const newImageIds = dicomFiles.map(file => {
            const id = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
            return id.toString();
        });
        
        setImageIds(newImageIds);
        setCurrentImageIndex(0);
        setLoadingStatus('');
    };

    const loadAndViewImage = useCallback(async (imageId) => {
        if (!imageId) {
            setLoadingStatus('No hay imagen para cargar');
            return;
        }

        try {
            setLoadingStatus('Cargando imagen...');
            const image = await cornerstone.loadAndCacheImage(imageId);
            
            if (imageRef.current) {
                if (currentView === 'Sagital') {
                    cornerstone.displayImage(imageRef.current, image);
                } else {
                    // Para vistas Coronal y Axial
                    const images = await Promise.all(
                        imageIds.map(id => cornerstone.loadAndCacheImage(id))
                    );

                    // Crear volumeData si no existe
                    if (!volumeData) {
                        const firstImage = images[0];
                        const width = firstImage.columns;
                        const height = firstImage.rows;
                        const depth = images.length;
                        const volume = new Float32Array(width * height * depth);

                        images.forEach((img, z) => {
                            const pixelData = img.getPixelData();
                            for (let i = 0; i < pixelData.length; i++) {
                                const x = i % width;
                                const y = Math.floor(i / width);
                                volume[z * width * height + y * width + x] = pixelData[i];
                            }
                        });

                        setVolumeData({
                            data: volume,
                            dimensions: { width, height, depth },
                            spacing: {
                                x: firstImage.columnPixelSpacing || 1,
                                y: firstImage.rowPixelSpacing || 1,
                                z: firstImage.sliceThickness || 1
                            }
                        });
                    }

                    // Generar la vista correspondiente
                    const sliceIndex = Math.floor(
                        currentView === 'Coronal' 
                            ? volumeData?.dimensions.width / 2 
                            : volumeData?.dimensions.height / 2
                    );
                    const viewData = generateView(currentView, sliceIndex);
                    if (viewData) {
                        const viewImage = createCornerstoneImage(viewData, currentView);
                        cornerstone.displayImage(imageRef.current, viewImage);
                    }
                }

                // Actualizar metadatos
                const metadatos = {
                    patientName: image.data.string('x00100010'),
                    patientID: image.data.string('x00100020'),
                    studyDate: image.data.string('x00080020'),
                    modality: image.data.string('x00080060'),
                    institutionName: image.data.string('x00080080'),
                };
                setDicomData(metadatos);
            }
            setLoadingStatus('');
        } catch (error) {
            setLoadingStatus(`Error al cargar la imagen: ${error.message}`);
            console.error('Error completo:', error);
        }
    }, [imageIds, currentView, volumeData]);

    useEffect(() => {
        if (imageIds.length > 0 && imageRef.current) {
            cornerstone.enable(imageRef.current);
            loadAndViewImage(imageIds[0]);
            setShowControls(true);

            const stack = {
                currentImageIdIndex: 0,
                imageIds: imageIds
            };

            cornerstoneTools.addStackStateManager(imageRef.current, ['stack']);
            cornerstoneTools.addToolState(imageRef.current, 'stack', stack);
        }
    }, [imageIds, loadAndViewImage]);

    useEffect(() => {
        return () => {
            if (imageRef.current) {
                cornerstone.disable(imageRef.current);
            }
        };
    }, []);

    const handleSliderChange = useCallback((newValue) => {
        if (!volumeData) return;

        const index = Math.min(Math.max(newValue, 0), 
            currentView === 'Sagital' ? imageIds.length - 1 :
            currentView === 'Coronal' ? volumeData.dimensions.width - 1 :
            volumeData.dimensions.height - 1
        );

        setSliceIndices(prev => ({
            ...prev,
            [currentView]: index
        }));

        if (currentView === 'Sagital') {
            setCurrentImageIndex(index);
            loadAndViewImage(imageIds[index]);
        } else {
            updateViewSlice(currentView, index);
        }
    }, [imageIds, currentView, volumeData]);

    const updateViewSlice = useCallback(async (viewType, sliceIndex) => {
        if (!volumeData || !imageRef.current) return;

        try {
            if (viewType === 'Sagital') {
                const image = await cornerstone.loadAndCacheImage(imageIds[sliceIndex]);
                cornerstone.displayImage(imageRef.current, image);
            } else {
                const viewData = generateView(viewType, sliceIndex);
                if (viewData) {
                    const viewImage = createCornerstoneImage(viewData, viewType);
                    cornerstone.displayImage(imageRef.current, viewImage);
                }
            }
        } catch (error) {
            console.error(`Error al actualizar vista ${viewType}:`, error);
        }
    }, [volumeData, imageIds]);

    const handleSliderMouseDown = (event) => {
        event.preventDefault();
        isDraggingRef.current = true;
        document.addEventListener('mousemove', handleSliderMouseMove);
        document.addEventListener('mouseup', handleSliderMouseUp);
    };

    const handleSliderMouseMove = useCallback((event) => {
        if (isDraggingRef.current && sliderRef.current) {
            const rect = sliderRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
            const maxSlices = currentView === 'Sagital' ? imageIds.length - 1 :
                             currentView === 'Coronal' ? volumeData?.dimensions.width - 1 :
                             volumeData?.dimensions.height - 1;
            const newValue = Math.round((x / rect.width) * maxSlices);
            handleSliderChange(newValue);
        }
    }, [handleSliderChange, currentView, imageIds.length, volumeData]);

    const handleSliderMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleSliderMouseMove);
        document.removeEventListener('mouseup', handleSliderMouseUp);
    }, [handleSliderMouseMove]);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleSliderMouseMove);
            document.removeEventListener('mouseup', handleSliderMouseUp);
        };
    }, [handleSliderMouseMove, handleSliderMouseUp]);

    const handleViewChange = (event) => {
        const newView = event.target.value;
        setCurrentView(newView);
        
        // Usar el índice guardado para la vista seleccionada
        const sliceIndex = sliceIndices[newView];
        if (newView === 'Sagital') {
            setCurrentImageIndex(sliceIndex);
            loadAndViewImage(imageIds[sliceIndex]);
        } else {
            updateViewSlice(newView, sliceIndex);
        }
    };

    const toggleInvert = useCallback(() => {
        if (!imageRef.current) return;
        
        const viewport = cornerstone.getViewport(imageRef.current);
        if (viewport) {
            viewport.invert = !inverted;
            cornerstone.setViewport(imageRef.current, viewport);
            setInverted(!inverted);
        }
    }, [inverted]);

    const Controls = ({ imageRef }) => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        
        const getMaxSlices = () => {
            if (!volumeData) return 0;
            switch (currentView) {
                case 'Sagital':
                    return imageIds.length - 1;
                case 'Coronal':
                    return volumeData.dimensions.width - 1;
                case 'Axial':
                    return volumeData.dimensions.height - 1;
                default:
                    return 0;
            }
        };

        const getCurrentSlice = () => {
            return sliceIndices[currentView];
        };

        return (
            <div>
                <div className="zoom-controls">
                    <button className="zoom-button" onClick={() => zoomIn()} title='Hacer Zoom a la imagen'>
                        <img src={ZoomIn} alt="Zoom In" />
                    </button>
                    <button className="zoom-button" onClick={() => zoomOut()} title='Reducir el Zoom de la imagen'>
                        <img src={ZoomOut} alt="Zoom Out" />
                    </button>
                    <button className="zoom-button" onClick={() => resetTransform()} title='Reestablecer nivel de Zoom'>
                        <img src={Reset} alt="Reset" />
                    </button>
                    
                    <ContrastControl imageRef={imageRef} />

                    <button className="zoom-button" onClick={toggleInvert} title='Invertir los colores de la Imagen'>
                        <img src={InvertIcon} alt="Invert" />
                    </button>
                </div>

                <select 
                    value={currentView} 
                    onChange={handleViewChange}
                    className="mt-4 p-2 border rounded"
                >
                    <option value="Sagital">Vista Sagital</option>
                    <option value="Coronal">Vista Coronal</option>
                    <option value="Axial">Vista Axial</option>
                </select>

                <div style={{ marginTop: '10px', userSelect: 'none' }}>
                    <div
                        ref={sliderRef}
                        style={{
                            width: '100%',
                            height: '20px',
                            background: '#ddd',
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}
                        onMouseDown={handleSliderMouseDown}
                    >
                        <div
                            style={{
                                width: `${(getCurrentSlice() / getMaxSlices()) * 100}%`,
                                height: '100%',
                                background: '#4CAF50',
                                position: 'absolute',
                                transition: 'width 0.1s ease-out'
                            }}
                        />
                        <div
                            style={{
                                width: '10px',
                                height: '20px',
                                background: '#fff',
                                border: '2px solid #4CAF50',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '50%',
                                left: `calc(${(getCurrentSlice() / getMaxSlices()) * 100}% - 5px)`,
                                transform: 'translateY(-50%)',
                                transition: 'left 0.1s ease-out'
                            }}
                        />
                    </div>

                    <div style={{ marginTop: '5px', textAlign: 'center' }}>
                        Corte {getCurrentSlice() + 1} de {getMaxSlices() + 1}
                    </div>
                </div>
            </div>
        );
    };

    return (
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <input type="file" onChange={onFolderChange} webkitdirectory="" directory="" multiple />
                {loadingStatus && <p>{loadingStatus}</p>}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '40px' }}>
                    {dicomData && (
                        <div className="dicom-metadata">
                            <h2>Metadatos DICOM</h2>
                            <div className="info-row">
                                <strong>Paciente:</strong>
                                <span>{dicomData.patientName} / {paciente?.nombre}</span>
                            </div>
                            <div className="info-row">
                                <strong>ID Paciente:</strong>
                                <span>{dicomData.patientID} / {paciente?.rut}</span>
                            </div>
                            <div className="info-row">
                                <strong>Fecha del Estudio:</strong>
                                <span>{dicomData.studyDate}</span>
                            </div>
                            <div className="info-row">
                                <strong>Nombre Institución:</strong>
                                <span>{dicomData.institutionName}</span>
                            </div>
                            <div className="info-row">
                                <strong>Modalidad:</strong>
                                <span>{dicomData.modality}</span>
                            </div>
                            <div className="info-row">
                                <strong>Número Imagen:</strong>
                                <span>{currentImageIndex + 1} / {imageIds.length}</span>
                            </div>
                            <div className="info-row">
                                <strong>Vista Actual:</strong>
                                <span>{currentView}</span>
                            </div>
                            <button onClick={() => console.log('Acción personalizada')}>Ver más detalles</button>
                            <div className="view-info">
                                <em>Información actualizada en tiempo real</em>
                            </div>
                            <Link to="/dicom-views">
                                <button>Ver Vistas</button>
                            </Link>
                        </div>
                    )}

                    <div>
                        <TransformWrapper>
                            <TransformComponent>
                                <div 
                                    ref={imageRef}
                                    style={{ 
                                        width: '512px', 
                                        height: '512px',
                                        border: '1px solid black',
                                        backgroundColor: '#f0f0f0'
                                    }}
                                >
                                    {imageIds.length === 0 && (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#666'
                                        }}>
                                            No hay imágenes cargadas
                                        </div>
                                    )}
                                    
                                </div>
                            </TransformComponent>
                            {showControls && <Controls imageRef={imageRef} />}
                        </TransformWrapper>
                        
                    </div>
                    
                </div>  
                
            </div>
            
        </div>
        
    );
};

export default Dicom;