import { ImagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { resolveAssetUrl } from '../services/api.js';

export default function ImageUpload({ label = 'Image', value, file, onFileChange, error }) {
  const [preview, setPreview] = useState(resolveAssetUrl(value));

  useEffect(() => {
    if (!file) {
      setPreview(resolveAssetUrl(value));
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, value]);

  return (
    <div className="admin-field">
      <span>{label}</span>
      <label className={`admin-image-upload ${error ? 'has-error' : ''}`}>
        {preview ? (
          <img src={preview} alt="" width="640" height="400" loading="lazy" decoding="async" />
        ) : (
          <span className="admin-upload-placeholder">
            <ImagePlus size={28} />
          </span>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>
      {error && <small>{error}</small>}
    </div>
  );
}
