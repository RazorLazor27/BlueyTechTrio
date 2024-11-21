import React, { useState, useEffect, useCallback } from 'react';
import cornerstone from 'cornerstone-core';
import ContrastIcon from '../assets/icons/contrast.png';

const ContrastControl = ({ imageRef }) => {
    const [windowWidth, setWindowWidth] = useState(100);
    const [windowCenter, setWindowCenter] = useState(50);
    const [showSliders, setShowSliders] = useState(false);
    const [ranges, setRanges] = useState({
        windowWidth: { min: 1, max: 400, default: 100 },
        windowCenter: { min: -100, max: 100, default: 50 }
    });

    // Función para calcular el rango óptimo
    const calculateOptimalRange = (value) => {
        const absValue = Math.abs(value);
        const max = Math.ceil(absValue / 100) * 100;
        const min = 1;
        return { min, max, default: value };
    };

    useEffect(() => {
        if (!imageRef.current) return;

        try {
            const enabledElement = cornerstone.getEnabledElement(imageRef.current);
            if (!enabledElement || !enabledElement.image) return;

            const image = enabledElement.image;
            const imageWindowWidth = image.windowWidth || 100;
            const imageWindowCenter = image.windowCenter || 50;

            const widthRange = calculateOptimalRange(imageWindowWidth);
            const centerRange = calculateOptimalRange(imageWindowCenter);

            setRanges({
                windowWidth: widthRange,
                windowCenter: centerRange
            });

            setWindowWidth(imageWindowWidth);
            setWindowCenter(imageWindowCenter);

        } catch (error) {
            console.error('Error al obtener valores iniciales:', error);
        }
    }, [imageRef]);

    const updateImageContrast = useCallback(() => {
        if (!imageRef.current) return;

        try {
            const enabledElement = cornerstone.getEnabledElement(imageRef.current);
            if (!enabledElement || !enabledElement.image) return;

            const viewport = cornerstone.getViewport(imageRef.current);
            if (!viewport) return;

            viewport.voi.windowWidth = windowWidth;
            viewport.voi.windowCenter = windowCenter;
            cornerstone.setViewport(imageRef.current, viewport);
        } catch (error) {
            console.error('Error al actualizar el contraste:', error);
        }
    }, [windowWidth, windowCenter, imageRef]);

    useEffect(() => {
        updateImageContrast();
    }, [windowWidth, windowCenter, updateImageContrast]);

    const handleContrastChange = (event) => {
        const value = parseInt(event.target.value);
        setWindowWidth(value);
    };

    const handleBrightnessChange = (event) => {
        const value = parseInt(event.target.value);
        setWindowCenter(value);
    };

    const resetContrast = () => {
        if (!imageRef.current) return;

        try {
            const enabledElement = cornerstone.getEnabledElement(imageRef.current);
            if (!enabledElement || !enabledElement.image) return;

            const image = enabledElement.image;
            setWindowWidth(image.windowWidth || ranges.windowWidth.default);
            setWindowCenter(image.windowCenter || ranges.windowCenter.default);
        } catch (error) {
            console.error('Error al restablecer el contraste:', error);
        }
    };

    return (
        <div className="contrast-control-wrapper">
            <button 
                className="zoom-button" 
                onClick={() => setShowSliders(!showSliders)}
                title="Ajustar Contraste y Brillo"
            >
                <img src={ContrastIcon} alt="Ajustar Contraste" />
            </button>

            {showSliders && (
                <div className="contrast-control-panel">
                    <div className="contrast-slider-group">
                        <label>Contraste (Window Width):</label>
                        <input
                            type="range"
                            min={ranges.windowWidth.min}
                            max={ranges.windowWidth.max}
                            value={windowWidth}
                            onChange={handleContrastChange}
                            className="contrast-range-input"
                        />
                        <span className="contrast-value-display">{windowWidth}</span>
                    </div>

                    <div className="contrast-slider-group">
                        <label>Brillo (Window Center):</label>
                        <input
                            type="range"
                            min={ranges.windowCenter.min}
                            max={ranges.windowCenter.max}
                            value={windowCenter}
                            onChange={handleBrightnessChange}
                            className="contrast-range-input"
                        />
                        <span className="contrast-value-display">{windowCenter}</span>
                    </div>

                    <button 
                        onClick={resetContrast}
                        className="contrast-reset-button"
                    >
                        Restablecer
                    </button>
                    
                    <div className="contrast-range-info">
                        <small>Rango Contraste: {ranges.windowWidth.min} - {ranges.windowWidth.max}</small>
                        <small>Rango Brillo: {ranges.windowCenter.min} - {ranges.windowCenter.max}</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContrastControl;