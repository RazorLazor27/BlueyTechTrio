import React, { useState, useEffect, useRef } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useLocation } from 'react-router-dom';

// Inicialización de loaders y configuración de Cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: { convertFloatPixelDataToInt: false },
});
cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: false,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: true,
        strict: false,
      },
    },
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const Dicom = () => {
    const location = useLocation();
    const { paciente } = location.state || {}; 
    const [files, setFiles] = useState([]);
    const [dicomData, setDicomData] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const imageRefs = useRef([]);

    const onFolderChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const dicomFiles = selectedFiles.filter(file => file.name.toLowerCase().endsWith('.dcm'));
        const fileUrls = dicomFiles.map(file => URL.createObjectURL(file));
        setFiles(fileUrls);
    };

    const loadDicomImage = async (url, index) => {
        try {
            const image = await cornerstone.loadImage('wadouri:' + url);
            const metadatos = {
                patientName: image.data.string('x00100010'),
                patientID: image.data.string('x00100020'),
                studyDate: image.data.string('x00080020'),
                studyTime: image.data.string('x00080030'),
                modality: image.data.string('x00080060'),
                institutionName: image.data.string('x00080080'),
                studyInstanceUID: image.data.string('x0020000D'),
            };
            setDicomData(prevData => [...prevData, metadatos]);

            if (imageRefs.current[index]) {
                cornerstone.enable(imageRefs.current[index]);
                cornerstone.displayImage(imageRefs.current[index], image);
            }
        } catch (error) {
            console.error('Error al cargar la imagen DICOM: ', error);
        }
    };

    useEffect(() => {
        if (files.length > 0) {
            files.forEach((file, index) => loadDicomImage(file, index));
            setShowControls(true);
        }
    }, [files]);

    useEffect(() => {
        if (dicomData.length > currentImageIndex && imageRefs.current[currentImageIndex]) {
            cornerstone.resize(imageRefs.current[currentImageIndex]);
        }
    }, [currentImageIndex, dicomData]);

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        return (
            <div>
                <button onClick={() => zoomIn()}>Zoom In</button>
                <button onClick={() => zoomOut()}>Zoom Out</button>
                <button onClick={() => resetTransform()}>Reset</button>
                <button onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : files.length - 1))}>Anterior</button>
                <button onClick={() => setCurrentImageIndex(prev => (prev < files.length - 1 ? prev + 1 : 0))}>Siguiente</button>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '40px' }}>
                {dicomData.length > 0 && (
                    <div style={{ marginRight: '40px', textAlign: 'justify' }}>
                        <h2 style={{ marginBottom: '10px' }}>Metadatos DICOM</h2>
                        <p><strong>Paciente:</strong> {dicomData[currentImageIndex]?.patientName} / {paciente?.nombre} </p>
                        <p><strong>ID Paciente:</strong> {dicomData[currentImageIndex]?.patientID} / {paciente?.rut}</p>
                        <p><strong>Fecha Nacimiento:</strong> {dicomData[currentImageIndex]?.patientBirthDate} / {paciente?.fecha_nacimiento && formatDate(paciente.fecha_nacimiento)}</p>
                        <p><strong>Sexo:</strong> {dicomData[currentImageIndex]?.patientSex} / {paciente?.sexo} </p>
                        <p><strong>ID del Estudio:</strong> {dicomData[currentImageIndex]?.studyInstanceUID} / {paciente?._id}</p>
                        <p><strong>Fecha del Estudio:</strong> {dicomData[currentImageIndex]?.studyDate}</p>
                        <p><strong>Nombre Institución:</strong> {dicomData[currentImageIndex]?.institutionName}</p>
                        <p><strong>Modalidad:</strong> {dicomData[currentImageIndex]?.modality}</p>
                        <p><strong>Numero Imagen:</strong> {currentImageIndex + 1} / {files.length}</p>
                    </div>
                )}
                <div>
                    <input type="file" onChange={onFolderChange} webkitdirectory="" directory="" multiple />
                    <TransformWrapper>
                        <TransformComponent>
                            {files.map((file, index) => (
                                <div 
                                    key={index} 
                                    ref={el => imageRefs.current[index] = el}
                                    style={{ 
                                        width: '512px', 
                                        height: '512px', 
                                        display: index === currentImageIndex ? 'block' : 'none' 
                                    }}
                                ></div>
                            ))}
                        </TransformComponent>
                        {showControls && <Controls />}
                    </TransformWrapper>
                </div>
            </div>
        </div>
    );
};

export default Dicom;