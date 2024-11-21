import React, { useState, useEffect, useRef } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import cornerstoneTools from 'cornerstone-tools';
import dicomParser from 'dicom-parser';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Inicialización de Cornerstone y sus herramientas
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = window.Hammer;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneWADOImageLoader.configure({
    useWebWorkers: true,
});

cornerstoneTools.init();

const DicomViews = () => {
    const [imageIds, setImageIds] = useState([]);
    const [volumeData, setVolumeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [elementsReady, setElementsReady] = useState({
        axial: false,
        sagittal: false,
        coronal: false
    });
    const [currentSlices, setCurrentSlices] = useState({
        axial: 0,
        sagittal: 0,
        coronal: 0
    });
    
    const axialRef = useRef(null);
    const sagittalRef = useRef(null);
    const coronalRef = useRef(null);
    
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const initializeElement = async (ref, viewType) => {
            if (ref.current && isMounted.current) {
                try {
                    try {
                        cornerstone.disable(ref.current);
                    } catch (e) {}
                    await cornerstone.enable(ref.current);
                    if (isMounted.current) {
                        setElementsReady(prev => ({
                            ...prev,
                            [viewType]: true
                        }));
                    }
                } catch (error) {
                    console.error(`Error al inicializar elemento ${viewType}:`, error);
                }
            }
        };

        initializeElement(axialRef, 'axial');
        initializeElement(sagittalRef, 'sagittal');
        initializeElement(coronalRef, 'coronal');

        return () => {
            [
                { ref: axialRef, type: 'axial' },
                { ref: sagittalRef, type: 'sagittal' },
                { ref: coronalRef, type: 'coronal' }
            ].forEach(({ ref, type }) => {
                if (ref.current) {
                    try {
                        cornerstone.disable(ref.current);
                        if (isMounted.current) {
                            setElementsReady(prev => ({
                                ...prev,
                                [type]: false
                            }));
                        }
                    } catch (error) {}
                }
            });
        };
    }, []);

    const handleFileUpload = async (event) => {
        setLoading(true);
        const files = Array.from(event.target.files);
        const dicomFiles = files.filter(file => file.name.toLowerCase().endsWith('.dcm'));
        
        if (dicomFiles.length === 0) {
            alert('No se encontraron archivos DICOM');
            setLoading(false);
            return;
        }

        dicomFiles.sort((a, b) => a.name.localeCompare(b.name));

        const newImageIds = dicomFiles.map(file => {
            return cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        });

        setImageIds(newImageIds);
        await loadVolume(newImageIds);
    };

    const loadVolume = async (ids) => {
        try {
            const images = await Promise.all(
                ids.map(imageId => cornerstone.loadAndCacheImage(imageId))
            );

            const firstImage = images[0];
            const width = firstImage.columns;
            const height = firstImage.rows;
            const depth = images.length;

            const volume = new Float32Array(width * height * depth);

            images.forEach((image, z) => {
                const pixelData = image.getPixelData();
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

            setCurrentSlices({
                axial: Math.floor(depth / 2),
                sagittal: Math.floor(width / 2),
                coronal: Math.floor(height / 2)
            });

            await enableElements();
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar el volumen:', error);
            setLoading(false);
            alert('Error al cargar las imágenes DICOM');
        }
    };

    const generateView = (type, sliceIndex) => {
        if (!volumeData) return null;
        
        const { data, dimensions } = volumeData;
        const { width, height, depth } = dimensions;
        
        let viewData;
        
        switch(type) {
            case 'sagittal':
                viewData = new Float32Array(height * depth);
                for (let y = 0; y < height; y++) {
                    for (let z = 0; z < depth; z++) {
                        viewData[y * depth + z] = data[z * width * height + y * width + sliceIndex];
                    }
                }
                return {
                    pixelData: viewData,
                    width: depth,
                    height: height
                };
                
            case 'coronal':
                viewData = new Float32Array(width * depth);
                for (let x = 0; x < width; x++) {
                    for (let z = 0; z < depth; z++) {
                        viewData[z * width + x] = data[z * width * height + sliceIndex * width + x];
                    }
                }
                return {
                    pixelData: viewData,
                    width: width,
                    height: depth
                };
                
            default:
                return null;
        }
    };

    const createCornerstoneImage = (viewData, type) => {
        const minPixelValue = Math.min(...viewData.pixelData);
        const maxPixelValue = Math.max(...viewData.pixelData);

        const windowCenter = (minPixelValue + maxPixelValue) / 2;
        const windowWidth = maxPixelValue - minPixelValue;

        return {
            imageId: `${type}_${Date.now()}`,
            minPixelValue: minPixelValue,
            maxPixelValue: maxPixelValue,
            slope: 0.8,
            intercept: 0,
            windowCenter: windowCenter,
            windowWidth: windowWidth * 1,
            getPixelData: () => viewData.pixelData,
            rows: viewData.height,
            columns: viewData.width,
            height: viewData.height,
            width: viewData.width,
            color: false,
            columnPixelSpacing: volumeData.spacing.x,
            rowPixelSpacing: volumeData.spacing.y,
            sizeInBytes: viewData.pixelData.length * 4
        };
    };

    const updateViews = async () => {
        if (!volumeData || !imageIds.length) return;

        const updateView = async (ref, viewType, sliceIndex) => {
            if (!ref.current || !elementsReady[viewType]) return;

            try {
                let elementEnabled = false;
                try {
                    elementEnabled = cornerstone.getEnabledElement(ref.current);
                } catch (e) {}

                if (!elementEnabled) {
                    await cornerstone.enable(ref.current);
                }

                if (viewType === 'axial') {
                    const image = await cornerstone.loadAndCacheImage(imageIds[sliceIndex]);
                    if (isMounted.current) {
                        await cornerstone.displayImage(ref.current, image);
                    }
                } else {
                    const viewData = generateView(viewType, sliceIndex);
                    if (viewData && isMounted.current) {
                        const image = createCornerstoneImage(viewData, viewType);
                        await cornerstone.displayImage(ref.current, image);
                    }
                }
            } catch (error) {
                console.error(`Error al actualizar vista ${viewType}:`, error);
                if (isMounted.current) {
                    try {
                        await cornerstone.enable(ref.current);
                        setElementsReady(prev => ({
                            ...prev,
                            [viewType]: true
                        }));
                    } catch (e) {
                        console.error(`Error al reinicializar elemento ${viewType}:`, e);
                    }
                }
            }
        };

        for (const { ref, type, slice } of [
            { ref: axialRef, type: 'axial', slice: currentSlices.axial },
            { ref: sagittalRef, type: 'sagittal', slice: currentSlices.sagittal },
            { ref: coronalRef, type: 'coronal', slice: currentSlices.coronal }
        ]) {
            await updateView(ref, type, slice);
        }
    };

    useEffect(() => {
        if (volumeData && imageIds.length > 0 && 
            Object.values(elementsReady).some(ready => ready)) {
            const frameId = requestAnimationFrame(() => {
                const timer = setTimeout(() => {
                    if (isMounted.current) {
                        updateViews();
                    }
                }, 100);
                return () => clearTimeout(timer);
            });
            return () => cancelAnimationFrame(frameId);
        }
    }, [currentSlices, volumeData, imageIds, elementsReady]);

    const handleSliceChange = (type, value) => {
        setCurrentSlices(prev => ({
            ...prev,
            [type]: parseInt(value)
        }));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Visualizador DICOM Multiplanar</h1>
            
            <div className="mb-4">
                <input
                    type="file"
                    onChange={handleFileUpload}
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="mb-4"
                />
            </div>

            {loading ? (
                <div className="text-center p-4">
                    Cargando imágenes DICOM...
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {/* Vista Axial */}
                    <div className="border rounded p-2">
                        <h2 className="text-lg font-semibold mb-2">Vista Axial</h2>
                        <TransformWrapper>
                            <TransformComponent>
                                <div 
                                    ref={axialRef}
                                    className="w-full h-64 bg-black"
                                />
                            </TransformComponent>
                        </TransformWrapper>
                        {volumeData && (
                            <input
                                type="range"
                                min="0"
                                max={volumeData.dimensions.depth - 1}
                                value={currentSlices.axial}
                                onChange={(e) => handleSliceChange('axial', e.target.value)}
                                className="w-full mt-2"
                            />
                        )}
                    </div>

                    {/* Vista Sagital */}
                    <div className="border rounded p-2">
                        <h2 className="text-lg font-semibold mb-2">Vista Sagital</h2>
                        <TransformWrapper>
                            <TransformComponent>
                                <div 
                                    ref={sagittalRef}
                                    className="w-full h-64 bg-black"
                                />
                            </TransformComponent>
                        </TransformWrapper>
                        {volumeData && (
                            <input
                                type="range"
                                min="0"
                                max={volumeData.dimensions.width - 1}
                                value={currentSlices.sagittal}
                                onChange={(e) => handleSliceChange('sagittal', e.target.value)}
                                className="w-full mt-2"
                            />
                        )}
                    </div>

                    {/* Vista Coronal */}
                    <div className="border rounded p-2">
                        <h2 className="text-lg font-semibold mb-2">Vista Coronal</h2>
                        <TransformWrapper>
                            <TransformComponent>
                                <div 
                                    ref={coronalRef}
                                    className="w-full h-64 bg-black"
                                />
                            </TransformComponent>
                        </TransformWrapper>
                        {volumeData && (
                            <input
                                type="range"
                                min="0"
                                max={volumeData.dimensions.height - 1}
                                value={currentSlices.coronal}
                                onChange={(e) => handleSliceChange('coronal', e.target.value)}
                                className="w-full mt-2"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DicomViews;