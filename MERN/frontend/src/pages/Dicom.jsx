import React, { useState, useEffect, useRef, useCallback } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import cornerstoneMath from 'cornerstone-math';
import cornerstoneTools from 'cornerstone-tools';
import dicomParser from 'dicom-parser';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useLocation } from 'react-router-dom';

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
    const [currentView, setCurrentView] = useState('axial');
    const [loadingStatus, setLoadingStatus] = useState('');
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

        const newImageIds = dicomFiles.map(file => cornerstoneWADOImageLoader.wadouri.fileManager.add(file));
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

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        return (
            <div>
                <button onClick={() => zoomIn()}>Zoom In</button>
                <button onClick={() => zoomOut()}>Zoom Out</button>
                <button onClick={() => resetTransform()}>Reset</button>
                <select value={currentView} onChange={handleViewChange}>
                    <option value="axial">Axial</option>
                    <option value="coronal">Coronal</option>
                    <option value="sagital">Sagital</option>
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
                        <div style={{ marginRight: '40px', textAlign: 'justify' }}>
                            <h2 style={{ marginBottom: '10px' }}>Metadatos DICOM</h2>
                            <p><strong>Paciente:</strong> {dicomData.patientName} / {paciente?.nombre} </p>
                            <p><strong>ID Paciente:</strong> {dicomData.patientID} / {paciente?.rut}</p>
                            <p><strong>Fecha del Estudio:</strong> {dicomData.studyDate}</p>
                            <p><strong>Nombre Institución:</strong> {dicomData.institutionName}</p>
                            <p><strong>Modalidad:</strong> {dicomData.modality}</p>
                            <p><strong>Numero Imagen:</strong> {currentImageIndex + 1} / {imageIds.length}</p>
                            <p><strong>Vista Actual:</strong> {currentView}</p>
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
                            {showControls && <Controls />}
                        </TransformWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dicom;