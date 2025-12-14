import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

const BG_IMAGE_URL = '/bg.jpeg';

// Gradient presets with Konva-compatible format
const GRADIENT_PRESETS = {
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)': {
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [0, '#667eea', 1, '#764ba2']
  },
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)': {
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [0, '#f093fb', 1, '#f5576c']
  },
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)': {
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [0, '#4facfe', 1, '#00f2fe']
  }
};

// Shadow presets
const SHADOW_PRESETS = {
  light: {
    blur: 10,
    offsetX: 0,
    offsetY: 5,
    opacity: 0.2
  },
  medium: {
    blur: 20,
    offsetX: 0,
    offsetY: 8,
    opacity: 0.3
  },
  heavy: {
    blur: 30,
    offsetX: 0,
    offsetY: 12,
    opacity: 0.4
  },
  soft: {
    blur: 40,
    offsetX: 0,
    offsetY: 15,
    opacity: 0.25
  },
  sharp: {
    blur: 5,
    offsetX: 0,
    offsetY: 3,
    opacity: 0.5
  },
  dramatic: {
    blur: 50,
    offsetX: 0,
    offsetY: 20,
    opacity: 0.5
  }
};

const ImageCanvas = ({ imageSrc, settings, onExport }) => {
  const stageRef = useRef();
  const containerRef = useRef();
  const [image] = useImage(imageSrc);
  const [bgImage] = useImage(BG_IMAGE_URL);
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
    shadowPreset = 'medium',
  } = settings;

  // Get shadow settings
  const shadowSettings = shadow ? SHADOW_PRESETS[shadowPreset] : null;

  // Image dimensions with border and padding
  const imageWidth = dimensions.width;
  const imageHeight = dimensions.height;

  // Calculate extra space needed for shadow
  const shadowSpace = shadowSettings ? Math.max(
    shadowSettings.blur + Math.abs(shadowSettings.offsetY),
    shadowSettings.blur + Math.abs(shadowSettings.offsetX)
  ) : 0;

  // Total canvas includes padding for background and shadow space
  const totalPadding = padding * 2;
  const canvasWidth = imageWidth + totalPadding + borderWidth * 2 + shadowSpace * 2;
  const canvasHeight = imageHeight + totalPadding + borderWidth * 2 + shadowSpace * 2;

  // Position of the image (centered with padding and shadow space)
  const imageX = padding + shadowSpace;
  const imageY = padding + shadowSpace;

  // Check background type
  const isGradient = GRADIENT_PRESETS[backgroundColor];
  const isBgImage = backgroundColor === 'bg-image';

  const getFillProp = () => {
    if (backgroundColor === 'transparent') return null;
    if (isGradient) return null; // We'll use fillLinearGradient instead
    if (isBgImage) return null; // We'll use fillPatternImage instead
    return backgroundColor;
  };

  const getGradientProps = () => {
    if (!isGradient) return {};

    const gradient = GRADIENT_PRESETS[backgroundColor];
    return {
      fillLinearGradientStartPoint: {
        x: gradient.start.x * canvasWidth,
        y: gradient.start.y * canvasHeight
      },
      fillLinearGradientEndPoint: {
        x: gradient.end.x * canvasWidth,
        y: gradient.end.y * canvasHeight
      },
      fillLinearGradientColorStops: gradient.colorStops
    };
  };

  const getBgImageProps = () => {
    if (!isBgImage || !bgImage) return {};

    return {
      fillPatternImage: bgImage,
      fillPatternScaleX: canvasWidth / bgImage.width,
      fillPatternScaleY: canvasHeight / bgImage.height,
      fillPatternRepeat: 'no-repeat'
    };
  };

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
          {/* Background Layer - behind everything */}
          {backgroundColor !== 'transparent' && (
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={getFillProp()}
              {...getGradientProps()}
              {...getBgImageProps()}
            />
          )}

          {/* Image with border and effects */}
          {image && (
            <>
              {/* Image */}
              <KonvaImage
                image={image}
                x={imageX}
                y={imageY}
                width={imageWidth}
                height={imageHeight}
                cornerRadius={borderRadius}
                shadowEnabled={shadow && shadowSettings !== null}
                shadowColor="black"
                shadowBlur={shadowSettings?.blur || 0}
                shadowOffset={{
                  x: shadowSettings?.offsetX || 0,
                  y: shadowSettings?.offsetY || 0
                }}
                shadowOpacity={shadowSettings?.opacity || 0}
              />

              {/* Border on top of image */}
              {borderWidth > 0 && (
                <Rect
                  x={imageX}
                  y={imageY}
                  width={imageWidth}
                  height={imageHeight}
                  stroke={borderColor}
                  strokeWidth={borderWidth}
                  cornerRadius={borderRadius}
                  listening={false}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageCanvas;
