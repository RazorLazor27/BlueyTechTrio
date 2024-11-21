import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ImagenAxial from '../components/ImagenAxial';
import ImagenCoronal from '../components/ImagenCoronal';
import ImagenSagital from '../components/ImagenSagital';

export default function DicomFile() {
    const location = useLocation();
    const { imageIds } = location.state || { imageIds: [] };

    const [slide1, setSlide1] = useState(0);
    const [slide2, setSlide2] = useState(0);
    const [slide3, setSlide3] = useState(0);
    const [viewType, setViewType] = useState('Axial');

    const handleChange1 = (e) => {
        const nuevoSlide1 = Number(e.target.value);
        setSlide1(nuevoSlide1);
    };

    const handleChange2 = (e) => {
        const nuevoSlide2 = Number(e.target.value);
        setSlide2(nuevoSlide2);
    };

    const handleChange3 = (e) => {
        const nuevoSlide3 = Number(e.target.value);
        setSlide3(nuevoSlide3);
    };

    const handleViewChange = (e) => {
        setViewType(e.target.value);
    };

    if (!imageIds || imageIds.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2>No hay imágenes cargadas</h2>
                <p>Por favor, carga imágenes DICOM primero</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <p>Total de imágenes cargadas: {imageIds.length}</p>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="view-select" style={{ marginRight: '15px' }}>
                    Selecciona el tipo de vista:
                </label>
                <select id="view-select" value={viewType} onChange={handleViewChange}>
                    <option value="Axial">Axial</option>
                    <option value="Coronal">Coronal</option>
                    <option value="Sagital">Sagital</option>
                </select>
            </div>

            {viewType === 'Sagital' && (
                <div>
                    <ImagenAxial 
                        imageId={imageIds[slide1]}
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max={imageIds.length - 1} 
                        value={slide1} 
                        onChange={handleChange1} 
                    />
                    <div>Imagen {slide1 + 1} de {imageIds.length}</div>
                </div>
            )}

            {viewType === 'Axial' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <ImagenCoronal imageId={imageIds[slide2]} />
                        {/* Controles debajo de la imagen */}
                        <div style={{ marginTop: '10px', width: '512px', margin: '0 auto' }}>
                            <input 
                                type="range" 
                                min="0" 
                                max={imageIds.length - 1} 
                                value={slide2} 
                                onChange={handleChange2}
                                style={{ width: '100%' }}
                            />
                            <div>Imagen {slide2 + 1} de {imageIds.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {viewType === 'Coronal' && (
                <div>
                    <ImagenSagital 
                        imageId={imageIds[slide3]}
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max={imageIds.length - 1} 
                        value={slide3} 
                        onChange={handleChange3} 
                    />
                    <div>Imagen {slide3 + 1} de {imageIds.length}</div>
                </div>
            )}
        </div>
    );
}