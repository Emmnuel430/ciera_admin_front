import React, { useState, useEffect, useRef } from "react";

const ImageUploadWithPreview = ({ images, setImages }) => {
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  const MAX_IMAGES = 5;
  const MAX_SIZE_MB = 5;

  // Aperçus
  useEffect(() => {
    const objectUrls = [];
    const safeImages = Array.isArray(images) ? images : [];

    const newPreviews = safeImages.map((file) => {
      if (typeof file === "string") {
        return `${process.env.REACT_APP_API_BASE_URL_STORAGE}/${file}`;
      } else {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return url;
      }
    });

    setPreviews(newPreviews);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Déclenchement du sélecteur de fichier
  const triggerUpload = () => {
    if (images.length >= MAX_IMAGES) {
      alert(`Vous ne pouvez pas ajouter plus de ${MAX_IMAGES} images.`);
      return;
    }
    inputRef.current?.click();
  };

  // Ajout d'une image
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`L'image dépasse ${MAX_SIZE_MB} Mo`);
      return;
    }

    setImages((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.length >= MAX_IMAGES) return arr;
      return [...arr, file];
    });

    e.target.value = null; // Reset input
  };

  // Supprimer image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <div className="d-flex flex-wrap gap-3">
        {/* Aperçus */}
        {previews.map((url, i) => (
          <div
            key={i}
            className="position-relative border rounded"
            style={{ width: 100, height: 100 }}
          >
            <img
              src={url}
              alt={`img-${i}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 4,
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-danger position-absolute top-0 end-0 p-1"
              style={{ fontSize: 20, lineHeight: "20px" }}
              onClick={() => removeImage(i)}
            >
              ×
            </button>
          </div>
        ))}

        {/* Bouton + pour ajout */}
        {images.length < MAX_IMAGES && (
          <div
            onClick={triggerUpload}
            className="d-flex justify-content-center align-items-center border rounded"
            style={{
              width: 100,
              height: 100,
              cursor: "pointer",
              //   background: "#f8f9fa",
            }}
          >
            <span style={{ fontSize: 24, color: "#888" }}>+</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUploadWithPreview;
