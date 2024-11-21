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
    const [currentView, setCurrentView] = useState('Sagital');
    const [loadingStatus, setLoadingStatus] = useState('');
    const [inverted, setInverted] = useState(false);
    const imageRef = useRef(null);
    const sliderRef = useRef(null);
    const isDraggingRef = useRef(false);

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
                cornerstone.displayImage(imageRef.current, image);
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
        }
    }, []);

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
        const index = Math.min(Math.max(newValue, 0), imageIds.length - 1);
        setCurrentImageIndex(index);
        if (imageIds[index]) {
            loadAndViewImage(imageIds[index]);
        }
    }, [imageIds, loadAndViewImage]);

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
            const newValue = Math.round((x / rect.width) * (imageIds.length - 1));
            handleSliderChange(newValue);
        }
    }, [handleSliderChange, imageIds.length]);

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
        setCurrentView(event.target.value);
        // Aquí podrías implementar la lógica para cambiar entre diferentes vistas
        // Por ahora, solo cambiamos el estado
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
    
        return (
            <div>
                <div className="zoom-controls">
                    <button className="zoom-button" onClick={() => zoomIn()}  title='Hacer Zoom a la imagen'>
                        <img src={ZoomIn} alt="Zoom In" />
                    </button>
                    <button className="zoom-button" onClick={() => zoomOut()} title='Reducir el Zoom de la imagen'>
                        <img src={ZoomOut} alt="Zoom Out" />
                    </button>
                    <button className="zoom-button" onClick={() => resetTransform()} title='Reestablecer nivel de Zoom'>
                        <img src={Reset} alt="Reset" />
                    </button>
                    
                    <ContrastControl imageRef={imageRef} />

                    <button className="zoom-button" onClick={() => toggleInvert()} title='Invertir los colores de la Imagen'>
                        <img src={InvertIcon} alt="Invert" />
                    </button>
                </div>
    
                <select value={currentView} onChange={handleViewChange}>
                    <option value="Axial">Sagital</option>
                    <option value="Coronal">Coronal</option>
                    <option value="Sagital">Axial</option>
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
                                width: `${(currentImageIndex / (imageIds.length - 1)) * 100}%`,
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
                                left: `calc(${(currentImageIndex / (imageIds.length - 1)) * 100}% - 5px)`,
                                transform: 'translateY(-50%)',
                                transition: 'left 0.1s ease-out'
                            }}
                        />
                    </div>
    
                    <div style={{ marginTop: '5px', textAlign: 'center' }}>
                        Imagen {currentImageIndex + 1} de {imageIds.length}
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