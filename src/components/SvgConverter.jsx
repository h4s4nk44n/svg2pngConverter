import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import './SvgConverter.css';

const SvgConverter = () => {
  const [svgFile, setSvgFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSvgFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        // Get dimensions when file is loaded
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = atob(e.target.result.split(',')[1]);
        const svgElement = tempDiv.querySelector('svg');
        const width = svgElement.width.baseVal.value || svgElement.viewBox.baseVal.width;
        const height = svgElement.height.baseVal.value || svgElement.viewBox.baseVal.height;
        setDimensions({ width, height });
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false,
    onDrop
  });

  const handleConversion = () => {
    if (!preview) return;
  
    // Create a temporary SVG element to get the original dimensions
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = atob(preview.split(',')[1]);
    const svgElement = tempDiv.querySelector('svg');
    
    // Get original SVG dimensions
    const originalWidth = svgElement.width.baseVal.value || svgElement.viewBox.baseVal.width;
    const originalHeight = svgElement.height.baseVal.value || svgElement.viewBox.baseVal.height;
  
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Use original SVG dimensions for accurate scaling
      canvas.width = originalWidth * scale;
      canvas.height = originalHeight * scale;
  
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = svgFile.name.replace('.svg', '.png');
            saveAs(blob, fileName);
          }
        }, 'image/png', 1.0);
      } catch (error) {
        console.error('Conversion error:', error);
      }
    };
  
    img.onerror = (error) => {
      console.error('Image loading error:', error);
    };
  
    img.src = preview;
  };

  return (
    <div className="converter-container">
      <h1>SVG to PNG Converter</h1>
      
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drop your SVG file here, or click to select</p>
      </div>

      {svgFile && (
        <div className="controls">
          {preview && <img src={preview} alt="Preview" className="preview-image" />}
          
          {dimensions && (
            <div className="size-info">
              <p>Original size: {Math.round(dimensions.width)}px × {Math.round(dimensions.height)}px</p>
              <p>Scaled size: {Math.round(dimensions.width * scale)}px × {Math.round(dimensions.height * scale)}px</p>
            </div>
          )}
          
          <div className="scale-control">
            <label htmlFor="scale">Scale:</label>
            <input
              id="scale"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Math.max(0.1, parseFloat(e.target.value) || 1))}
            />
          </div>
          
          <button onClick={handleConversion} className="convert-button">
            Convert to PNG
          </button>
          
          <p className="file-name">Selected file: {svgFile.name}</p>
        </div>
      )}
    </div>
  );
};
export default SvgConverter;