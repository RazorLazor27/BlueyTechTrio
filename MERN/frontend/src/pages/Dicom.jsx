import React, { useState } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

import { useLocation } from 'react-router-dom';


// Esto sirve para inicializar los lectores de images DICOM, WADO es un alias para referirse a "Web Access to Dicom Objects"
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Sin esto simplemente no funciona, pero aqui habría que poner algun tipo de credencial en el caso de usar un servidor
cornerstoneWADOImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
    },
});

// Esta configuración optimiza la cantidad de recursos para usar la mayor cantidad de nucleos
// disponibles para renderizar la imagen
var config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: false,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: true,
        strict: false,
      },
    },
};
  
// Aplica la configuración 
cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

// Para que se vea ligeramente mejor la cuestion
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


const Dicom = () => {
    const location = useLocation()
    const { paciente } = location.state || {} 
    const [file, setFile] = useState(null);
    const [dicomData, setDicomData] = useState(null);

    // al peo si funciona xd

    console.log(JSON.stringify(paciente))

    // Cuando subes una imagen a la pagina, transforma la imagen en un url para luego mostrarla, si no hacemos esto
    // entonces en cualquier buscador tirara un error diciendo que por politica CORS no puede funcionar
    const onFileChange = (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        console.log(url)
        setFile(url);
    };


    // Efectivamente renderiza la imagen DICOM que nosotros subimos en la pagina web
    const onFileUpload = () => {
        cornerstone.loadImage('wadouri:' + file).then((image) => {


            const metadatos = {
                patientName: image.data.string('x00100010'), // Nombre del paciente
                patientID: image.data.string('x00100020'), // ID del paciente
                studyDate: image.data.string('x00080020'), // Fecha del estudio
                studyTime: image.data.string('x00080030'), // Hora del estudio
                accessionNumber: image.data.string('x00080050'), // Número de acceso
                modality: image.data.string('x00080060'), // Modalidad
                institutionName: image.data.string('x00080080'), // Nombre de la institución
                physicianOfRecord: image.data.string('x00081048'), // Médico que registra
                performingPhysicianName: image.data.string('x00081050'), // Nombre del médico que realizó el estudio
                patientBirthDate: image.data.string('x00100030'), // Fecha de nacimiento del paciente
                patientSex: image.data.string('x00100040'), // Sexo del paciente
                patientWeight: image.data.floatString('x00101030'), // Peso del paciente
                patientSize: image.data.floatString('x00101020'), // Talla del paciente (altura)
                patientAddress: image.data.string('x00101040'), // Dirección del paciente
                studyID: image.data.string('x00200010'), // ID del estudio
                seriesNumber: image.data.string('x00200011'), // Número de serie
                studyInstanceUID: image.data.string('x0020000D'), // UID de la instancia del estudio
                seriesInstanceUID: image.data.string('x0020000E'), // UID de la instancia de la serie
                imageNumber: image.data.string('x00200013'), // Número de imagen
            };

            console.log("metadatos DICOM", metadatos);

            setDicomData(metadatos)

            const element = document.getElementById('dicomImage');
            cornerstone.enable(element);
            cornerstone.displayImage(element, image);


        }).catch(error => {
            // Manejo de errores en caso de que la carga de la imagen falle
            console.error('Error al cargar la imagen DICOM: ', error);
        });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '40px' }}>
                {dicomData && (
                    <div style={{ marginRight: '40px', textAlign: 'justify' }}> {/* Aumenta el espacio entre la imagen y el texto */}
                        <h2 style={{ marginBottom: '10px' }}>Metadatos DICOM</h2> {/* Reduce el espacio entre el título y el texto */}
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
                    <div id="dicomImage" style={{width: '512px', height: '512px'}}></div>
                </div>
            </div>
        </div>
    );
}



export default Dicom;