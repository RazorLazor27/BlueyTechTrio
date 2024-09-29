import React, { useState } from 'react';
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
    const [file, setFile] = useState(null);
    const [dicomData, setDicomData] = useState(null);
    const [showControls, setShowControls] = useState(false);  // Estado para controlar la visibilidad de los controles

    const onFileChange = (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        setFile(url);
    };

    const onFileUpload = () => {
        cornerstone.loadImage('wadouri:' + file).then((image) => {
            const metadatos = {
                patientName: image.data.string('x00100010'),
                patientID: image.data.string('x00100020'),
                studyDate: image.data.string('x00080020'),
                studyTime: image.data.string('x00080030'),
                modality: image.data.string('x00080060'),
                institutionName: image.data.string('x00080080'),
                studyInstanceUID: image.data.string('x0020000D'),
            };
            setDicomData(metadatos);

            const element = document.getElementById('dicomImage');
            cornerstone.enable(element);
            cornerstone.displayImage(element, image);

            // Mostrar los controles después de que la imagen se haya cargado
            setShowControls(true);
        }).catch(error => {
            console.error('Error al cargar la imagen DICOM: ', error);
        });
    };

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        return (
            <div>
                <button onClick={() => zoomIn()}>Zoom In</button>
                <button onClick={() => zoomOut()}>Zoom Out</button>
                <button onClick={() => resetTransform()}>Reset</button>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '40px' }}>
                {dicomData && (
                    <div style={{ marginRight: '40px', textAlign: 'justify' }}>
                        <h2 style={{ marginBottom: '10px' }}>Metadatos DICOM</h2>
                        <p><strong>Paciente:</strong> {dicomData.patientName} / {paciente.nombre} </p>
                        <p><strong>ID Paciente:</strong> {dicomData.patientID} / {paciente.rut}</p>
                        <p><strong>Fecha Nacimiento:</strong> {dicomData.patientBirthDate} / {formatDate(paciente.fecha_nacimiento)}</p>
                        <p><strong>Sexo:</strong> {dicomData.patientSex} / {paciente.sexo} </p>
                        <p><strong>ID del Estudio:</strong> {dicomData.studyInstanceUID} / {paciente._id}</p>
                        <p><strong>Fecha del Estudio:</strong> {dicomData.studyDate}</p>
                        <p><strong>Nombre Institución:</strong> {dicomData.institutionName}</p>
                        <p><strong>Modalidad:</strong> {dicomData.modality}</p>
                        <p><strong>Numero Imagen:</strong> {dicomData.imageNumber}</p>
                    </div>
                )}
                <div>
                    <input type="file" onChange={onFileChange} />
                    <button onClick={onFileUpload}>Enviar Imagen</button>
                    <TransformWrapper>
                        <TransformComponent>
                            <div id="dicomImage" style={{ width: '512px', height: '512px' }}></div>
                        </TransformComponent>
                        {showControls && <Controls />} {/* Mostrar los controles solo si showControls es true */}
                    </TransformWrapper>
                </div>
            </div>
        </div>
    );
};

export default Dicom;
