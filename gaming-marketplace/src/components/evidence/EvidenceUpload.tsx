import React, { useState, useRef } from 'react';
import { Button } from '../discord/Button';
import './EvidenceUpload.css';

interface EvidenceUploadProps {
  orderId: string;
  onSubmit: (evidence: { imageFile: File; notes: string }) => void;
  onCancel: () => void;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  onSubmit,
  onCancel
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be PNG, JPG, or JPEG format');
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    return errors;
  };

  const checkImageDimensions = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        const errors: string[] = [];
        
        // Check minimum dimensions (800x600)
        if (img.width < 800 || img.height < 600) {
          errors.push('Image must be at least 800x600 pixels');
        }
        
        resolve(errors);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(['Invalid image file']);
      };
      
      img.src = url;
    });
  };

  const handleFileSelect = async (file: File) => {
    const fileErrors = validateFile(file);
    
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
      return;
    }
    
    const dimensionErrors = await checkImageDimensions(file);
    
    if (dimensionErrors.length > 0) {
      setErrors(dimensionErrors);
      return;
    }
    
    setErrors([]);
    setImageFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      setErrors(['Please select an image file']);
      return;
    }
    
    if (!notes.trim()) {
      setErrors(['Please provide completion notes']);
      return;
    }
    
    onSubmit({ imageFile, notes: notes.trim() });
  };

  const removeFile = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="evidence-upload">
      <form onSubmit={handleSubmit} className="evidence-upload__form">
        <div className="evidence-upload__section">
          <h3 className="evidence-upload__section-title">Upload Screenshot</h3>
          <p className="evidence-upload__section-description">
            Upload a screenshot showing the completed work. File must be PNG, JPG, or JPEG format, 
            maximum 10MB, and at least 800x600 pixels.
          </p>
          
          <div
            className={`evidence-upload__dropzone ${
              dragActive ? 'evidence-upload__dropzone--active' : ''
            } ${imageFile ? 'evidence-upload__dropzone--has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInputChange}
              className="evidence-upload__file-input"
            />
            
            {!imageFile ? (
              <div className="evidence-upload__dropzone-content">
                <div className="evidence-upload__dropzone-icon">📷</div>
                <div className="evidence-upload__dropzone-text">
                  <strong>Click to upload</strong> or drag and drop
                </div>
                <div className="evidence-upload__dropzone-hint">
                  PNG, JPG, JPEG (max 10MB, min 800x600)
                </div>
              </div>
            ) : (
              <div className="evidence-upload__file-preview">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Evidence preview"
                    className="evidence-upload__preview-image"
                  />
                )}
                <div className="evidence-upload__file-info">
                  <div className="evidence-upload__file-name">{imageFile.name}</div>
                  <div className="evidence-upload__file-size">
                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="evidence-upload__section">
          <h3 className="evidence-upload__section-title">Completion Notes</h3>
          <p className="evidence-upload__section-description">
            Provide details about the completed work, any important notes, or additional information.
          </p>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the completed work, any challenges faced, or additional notes..."
            className="evidence-upload__textarea"
            rows={4}
            maxLength={1000}
          />
          <div className="evidence-upload__char-count">
            {notes.length}/1000 characters
          </div>
        </div>

        {errors.length > 0 && (
          <div className="evidence-upload__errors">
            {errors.map((error, index) => (
              <div key={index} className="evidence-upload__error">
                ⚠️ {error}
              </div>
            ))}
          </div>
        )}

        <div className="evidence-upload__actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={!imageFile || !notes.trim()}
          >
            Submit Evidence
          </Button>
        </div>
      </form>
    </div>
  );
};