import React, { useState } from 'react';
import ImagenAxial from '../components/ImagenAxial';
import ImagenCoronal from '../components/ImagenCoronal';
import ImagenSagital from '../components/ImagenSagital';

export default function DicomFile() {
    const [slide1, setSlide1] = useState(0);
    const [slide2, setSlide2] = useState(0);
    const [slide3, setSlide3] = useState(0);
    const [viewType, setViewType] = useState('Axial'); // Estado para el tipo de vista

    const handleChange1 = (e) => {
        const nuevoSlide1 = Number(e.target.value);
        setSlide1(nuevoSlide1);
        console.log(nuevoSlide1);
    };
    const handleChange2 = (e) => {
        const nuevoSlide2 = Number(e.target.value);
        setSlide2(nuevoSlide2);
        console.log(nuevoSlide2);
    };
    const handleChange3 = (e) => {
        const nuevoSlide3 = Number(e.target.value);
        setSlide3(nuevoSlide3);
        console.log(nuevoSlide3);
    };

    const handleViewChange = (e) => {
        setViewType(e.target.value); // Actualiza el tipo de vista
    };

    return (
        <div>
            {/* Selector de vista */}
            <label htmlFor="view-select">Selecciona el tipo de vista: </label>
            <select id="view-select" value={viewType} onChange={handleViewChange}>
                <option value="Axial">Axial</option>
                <option value="Coronal">Coronal</option>
                <option value="Sagital">Sagital</option>
            </select>

            {/* Renderizado condicional basado en el tipo de vista */}
            {viewType === 'Axial' && (
                <div>
                    <ImagenAxial slide={slide1} />
                    <input type="range" min="0" max="119" value={slide1} onChange={handleChange1} />
                </div>
            )}

            {viewType === 'Coronal' && (
                <div>
                    <ImagenCoronal slide={slide2} />
                    <input type="range" min="0" max="255" value={slide2} onChange={handleChange2} />
                </div>
            )}

            {viewType === 'Sagital' && (
                <div>
                    <ImagenSagital slide={slide3} />
                    <input type="range" min="0" max="255" value={slide3} onChange={handleChange3} />
                </div>
            )}
        </div>
    );
}
