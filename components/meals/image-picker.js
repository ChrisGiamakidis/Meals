"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import classes from "./image-picker.module.css";

export default function ImagePicker({
  label,
  name,
  required = true,
  initialImage = null,
}) {
  const [pickedImage, setPickedImage] = useState(initialImage);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef();

  function handlePickClick() {
    inputRef.current.click();
  }

  function handlePreviewClick() {
    if (pickedImage) {
      setIsExpanded(true);
    } else {
      handlePickClick();
    }
  }

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setPickedImage(null);
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setPickedImage(fileReader.result);
    };

    fileReader.readAsDataURL(file);
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div
          className={classes.preview}
          onClick={handlePreviewClick}
          role="button"
          tabIndex={0}
        >
          {!pickedImage && <p>No image picked yet.</p>}
          {pickedImage && (
            <Image src={pickedImage} alt="Picked Image by User" fill />
          )}
        </div>
        <input
          ref={inputRef}
          className={classes.input}
          type="file"
          id={name}
          name={name}
          accept="image/png, image/jpeg"
          onChange={handleImageChange}
          required={required}
        />
        <button
          type="button"
          className={classes.button}
          onClick={handlePickClick}
        >
          {pickedImage ? "Change Image" : "Pick Image"}
        </button>
      </div>

      {isExpanded && pickedImage && (
        <div
          className={classes.modalOverlay}
          onClick={() => setIsExpanded(false)}
        >
          <button
            type="button"
            className={classes.closeButton}
            onClick={() => setIsExpanded(false)}
            aria-label="Close"
          >
            ×
          </button>
          <div className={classes.modalImage}>
            <Image
              src={pickedImage}
              alt="Picked Image by User"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
