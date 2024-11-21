const ImagenCoronal = ({ imageId }) => {
  const imageRef = useRef(null);

  useEffect(() => {
      if (!imageId || !imageRef.current) return;

      const loadAndViewImage = async () => {
          try {
              if (!cornerstone.getEnabledElement(imageRef.current)) {
                  cornerstone.enable(imageRef.current);
              }

              const image = await cornerstone.loadAndCacheImage(imageId);
              cornerstone.displayImage(imageRef.current, image);
          } catch (error) {
              console.error('Error al cargar/mostrar la imagen coronal:', error);
          }
      };

      loadAndViewImage();

      return () => {
          if (imageRef.current && cornerstone.getEnabledElement(imageRef.current)) {
              cornerstone.disable(imageRef.current);
          }
      };
  }, [imageId]);

  return (
      <div 
          ref={imageRef}
          style={{ 
              width: '512px', 
              height: '512px',
              border: '1px solid black',
              margin: '10px auto'
          }}
      />
  );
};

export default ImagenCoronal;