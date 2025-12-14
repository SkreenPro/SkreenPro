import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

const ImageCanvas = ({ imageSrc, settings, onExport }) => {
  const stageRef = useRef();
  const containerRef = useRef();
  const [image] = useImage(imageSrc);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (image) {
      setDimensions({ width: image.width, height: image.height });
    }
  }, [image]);

  // Handle responsive scaling
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !image) return;

      const container = containerRef.current.parentElement;
      const containerWidth = container.clientWidth - 80; // padding
      const containerHeight = container.clientHeight - 80;

      const {
        borderWidth = 0,
        padding = 0,
      } = settings;

      const totalPadding = padding * 2 + borderWidth * 2;
      const fullWidth = dimensions.width + totalPadding;
      const fullHeight = dimensions.height + totalPadding;

      // Calculate scale to fit container
      const scaleX = containerWidth / fullWidth;
      const scaleY = containerHeight / fullHeight;
      const newScale = Math.min(1, scaleX, scaleY);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    // Also update when settings change
    const timeoutId = setTimeout(updateScale, 100);

    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeoutId);
    };
  }, [image, dimensions, settings]);

  useEffect(() => {
    if (onExport && stageRef.current) {
      onExport(stageRef);
    }
  }, [onExport]);

  const {
    borderWidth = 0,
    borderColor = '#000000',
    borderRadius = 0,
    backgroundColor = 'transparent',
    padding = 0,
    shadow = false,
  } = settings;

  const totalPadding = padding * 2;
  const canvasWidth = dimensions.width + totalPadding + borderWidth * 2;
  const canvasHeight = dimensions.height + totalPadding + borderWidth * 2;

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      <Stage
        width={canvasWidth * scale}
        height={canvasHeight * scale}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {/* Background */}
          {backgroundColor !== 'transparent' && (
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={backgroundColor}
              cornerRadius={borderRadius + borderWidth}
            />
          )}

          {/* Border */}
          {borderWidth > 0 && (
            <Rect
              x={borderWidth / 2}
              y={borderWidth / 2}
              width={canvasWidth - borderWidth}
              height={canvasHeight - borderWidth}
              stroke={borderColor}
              strokeWidth={borderWidth}
              cornerRadius={borderRadius}
            />
          )}

          {/* Image */}
          {image && (
            <KonvaImage
              image={image}
              x={padding + borderWidth}
              y={padding + borderWidth}
              width={dimensions.width}
              height={dimensions.height}
              cornerRadius={borderRadius}
              shadowEnabled={shadow}
              shadowColor="black"
              shadowBlur={shadow ? 20 : 0}
              shadowOffset={shadow ? { x: 0, y: 10 } : { x: 0, y: 0 }}
              shadowOpacity={shadow ? 0.3 : 0}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageCanvas;
