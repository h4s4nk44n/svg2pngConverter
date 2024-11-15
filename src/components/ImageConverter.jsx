import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import './ImageConverter.css';

const ImageConverter = () => {
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [format, setFormat] = useState('png');

  const supportedFormats = {
    'image/svg+xml': ['.svg'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/bmp': ['.bmp'],
    'image/tiff': ['.tiff', '.tif'],
    'image/webp': ['.webp'],
    'image/heif': ['.heif', '.heic']
  };
  
  const browserSupportedFormats = {
    'png': true,
    'jpeg': true,
    'webp': true
  };

  const formatExtensions = {
    'png': 'png',
    'jpeg': 'jpg',
    'gif': 'gif',
    'bmp': 'bmp',
    'tiff': 'tiff',
    'webp': 'webp',
    'heif': 'heif'
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: supportedFormats,
    multiple: false,
    onDrop
  });

  const handleConversion = () => {
    if (!preview) return;
  
    if (!browserSupportedFormats[format]) {
      alert(`Sorry, ${format.toUpperCase()} conversion is not supported in the browser. 
             Currently supported output formats are: PNG, JPEG, and WebP.`);
      return;
    }
  
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = format === 'png' ? dimensions.width * scale : dimensions.width;
      const height = format === 'png' ? dimensions.height * scale : dimensions.height;
      
      canvas.width = width;
      canvas.height = height;
  
      const ctx = canvas.getContext('2d');
      
      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0, width, height);
  
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const originalExt = file.name.split('.').pop();
            const newExt = formatExtensions[format];
            const fileName = file.name.replace(new RegExp(`${originalExt}$`), newExt);
            saveAs(blob, fileName);
          }
        }, `image/${format}`, format === 'jpeg' ? 0.9 : 1.0);
      } catch (error) {
        console.error('Conversion error:', error);
        alert('Error during conversion. Please try another format.');
      }
    };
  
    img.onerror = (error) => {
      console.error('Image loading error:', error);
      alert('Error loading image. Please try again.');
    };
  
    img.src = preview;
  };

  return (
    <div className="converter-container">
      <h1>Image Converter</h1>
      
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drop your image file here, or click to select</p>
        <p className="supported-formats">
          Input formats: SVG, JPEG, PNG, GIF, BMP, TIFF, WebP, HEIF
          <br />
          Output formats: PNG, JPEG, WebP
        </p>
      </div>

      {file && (
        <div className="controls">
          {preview && <img src={preview} alt="Preview" className="preview-image" />}
          
          {dimensions && (
            <div className="size-info">
              <p>Original size: {Math.round(dimensions.width)}px × {Math.round(dimensions.height)}px</p>
              {['png', 'jpeg', 'webp'].includes(format) && (
                <p>Scaled size: {Math.round(dimensions.width * scale)}px × {Math.round(dimensions.height * scale)}px</p>
              )}
            </div>
          )}
          
          {['png', 'jpeg', 'webp'].includes(format) && (
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
          )}

          <div className="format-control">
            <label htmlFor="format">Convert to:</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          
          <button onClick={handleConversion} className="convert-button">
            Convert to {format.toUpperCase()}
          </button>
          
          <p className="file-name">Selected file: {file.name}</p>
        </div>
      )}
    </div>
  );
};

export default ImageConverter;