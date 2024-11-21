import React, { useState, useEffect } from 'react';
import ImagenAxial from '../components/ImagenAxial';
import ImagenCoronal from '../components/ImagenCoronal';
import ImagenSagital from '../components/ImagenSagital';

export default function DicomFile() {
    const [slide1, setSlide1] = useState(0);
    const [slide2, setSlide2] = useState(0);
    const [slide3, setSlide3] = useState(0);
    const [viewType, setViewType] = useState('Axial');
    const [cachedImages, setCachedImages] = useState({
        axial: [],
        coronal: [],
        sagital: []
    });

    useEffect(() => {
        const loadImages = async () => {
            const axialImages = [];
            const coronalImages = [];
            const sagitalImages = [];

            for (let i = 0; i <= 255; i++) {
                const numero = i;
                if (numero <= 119) {
                    const sagitalImage = new Image();
                    sagitalImage.src = `/vistas/sagital/sagital_${numero}.png`;
                    sagitalImages.push(sagitalImage);
                    console.log(`Loaded: /vistas/sagital/sagital_${numero}.png`);
                }

                const axialImage = new Image();
                axialImage.src = `/vistas/axial/axial_${numero}.png`;
                axialImages.push(axialImage);
                console.log(`Loaded: /vistas/axial/axial_${numero}.png`);

                const coronalImage = new Image();
                coronalImage.src = `/vistas/coronal/coronal_${numero}.png`;
                coronalImages.push(coronalImage);
                console.log(`Loaded: /vistas/coronal/coronal_${numero}.png`);
            }

            setCachedImages({
                axial: axialImages,
                coronal: coronalImages,
                sagital: sagitalImages
            });
        };

        loadImages();
    }, []);

    const handleChange1 = (e) => {
        const nuevoSlide1 = Number(e.target.value);
        setSlide1(nuevoSlide1);
        console.log(`Sagital slide set to: ${nuevoSlide1}`);
    };
    const handleChange2 = (e) => {
        const nuevoSlide2 = Number(e.target.value);
        setSlide2(nuevoSlide2);
        console.log(`Axial slide set to: ${nuevoSlide2}`);
    };
    const handleChange3 = (e) => {
        const nuevoSlide3 = Number(e.target.value);
        setSlide3(nuevoSlide3);
        console.log(`Coronal slide set to: ${nuevoSlide3}`);
    };

    const handleViewChange = (e) => {
        setViewType(e.target.value);
        console.log(`View type changed to: ${e.target.value}`);
    };

    const getImageSrc = (type, index) => {
        if (cachedImages[type] && cachedImages[type][index]) {
            console.log(`Rendering ${type} image with index: ${index}`);
            return cachedImages[type][index].src;
        } else {
            console.warn(`Image not found for ${type} at index: ${index}`);
            return '';
        }
    };

    return (
        <div>
            {/* Selector de vista */}
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="view-select" style={{ marginRight: '15px' }}>Selecciona el tipo de vista:</label>
                <select id="view-select" value={viewType} onChange={handleViewChange}>
                    <option value="Axial">Axial</option>
                    <option value="Coronal">Coronal</option>
                    <option value="Sagital">Sagital</option>
                </select>
            </div>

            {/* Renderizado condicional basado en el tipo de vista */}
            {viewType === 'Sagital' && cachedImages.sagital.length > 0 && slide1 < cachedImages.sagital.length && (
                <div>
                    <ImagenSagital image={getImageSrc('sagital', slide1)} alt={`Sagital slice ${slide1}`} />
                    <input type="range" min="0" max="119" value={slide1} onChange={handleChange1} />
                </div>
            )}

            {viewType === 'Axial' && cachedImages.axial.length > 0 && slide2 < cachedImages.axial.length && (
                <div>
                    <ImagenAxial image={getImageSrc('axial', slide2)} alt={`Axial slice ${slide2}`} />
                    <input type="range" min="0" max="255" value={slide2} onChange={handleChange2} />
                </div>
            )}

            {viewType === 'Coronal' && cachedImages.coronal.length > 0 && slide3 < cachedImages.coronal.length && (
                <div>
                    <ImagenCoronal image={getImageSrc('coronal', slide3)} alt={`Coronal slice ${slide3}`} />
                    <input type="range" min="0" max="255" value={slide3} onChange={handleChange3} />
                </div>
            )}
        </div>
    );
}
