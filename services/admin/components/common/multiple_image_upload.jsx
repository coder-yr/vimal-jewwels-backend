import React, { useState, useEffect } from "react";
import { Box, DropZone, Button, Icon } from "@adminjs/design-system";
import axios from "axios";
import { serverUrlApi, serverUrlImage } from "../constants";

const UploadMultipleImage = (props) => {
  const { property, onChange, record } = props;
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Extract existing images from record.params
    // AdminJS might flatten array as images.0, images.1 OR pass it as 'images' if it's a JSON object
    let existingImages = [];

    // Check for direct array
    if (record.params[property.name] && Array.isArray(record.params[property.name])) {
      existingImages = record.params[property.name];
    } else if (typeof record.params[property.name] === 'string') {
      // Try parsing JSON if it's a string
      try {
        const parsed = JSON.parse(record.params[property.name]);
        if (Array.isArray(parsed)) existingImages = parsed;
      } catch (e) { /* ignore */ }
    }

    // Check for flattened keys (images.0, images.0.src, images.1 ...)
    if (existingImages.length === 0) {
      const flattened = [];
      Object.keys(record.params).forEach(key => {
        // Match "images.0" or "images.0.src"
        // We want to capture the index and check if it's a src property or the direct value
        const match = key.match(new RegExp(`^${property.name}\\.(\\d+)(?:\\.src)?$`));
        if (match) {
          const index = parseInt(match[1], 10);
          if (!isNaN(index)) {
            // If it ends in .src, take the value. If it's just images.N, take the value.
            // We prefer .src if both exist (though unlikely to collide in a way that breaks this simple logic if we just overwrite)
            // Actually, if we have images.0.alt and images.0.src, we only want images.0.src
            // The regex ^images\.(\d+)(?:\.src)?$ matches "images.0" and "images.0.src" but NOT "images.0.alt"
            // So we are safe.
            flattened[index] = record.params[key];
          }
        }
      });
      // Remove empty slots if any
      existingImages = flattened.filter(i => i);
    }


    setImages(existingImages);
  }, [record.params, property.name]);

  const updateImages = (newImages) => {
    setImages(newImages);
    // Determine how to save. AdminJS usually expects an array for JSON fields.
    // We update the record param and trigger change
    record.params[property.name] = newImages;
    onChange(property.name, newImages);
  };

  const fileUpload = async (files) => {
    if (files.length > 0) {
      const uploadPromises = Array.from(files).map((file) => {
        const url = `${serverUrlApi}upload/image`;
        const formData = new FormData();
        formData.append("file", file);
        const config = {
          headers: {
            "content-type": "multipart/form-data",
          },
        };
        return axios.post(url, formData, config).then((response) => {
          if (response.status === 200) {
            return `${serverUrlImage}${response.data["filename"]}`;
          }
          return null;
        });
      });
      try {
        const uploadedImages = await Promise.all(uploadPromises);
        const validImages = uploadedImages.filter((img) => img !== null);

        // Append to existing
        updateImages([...images, ...validImages]);

      } catch (error) {
        console.error("Error uploading images:", error);
      }
    }
  };

  const removeImage = (indexToRemove) => {
    const updated = images.filter((_, index) => index !== indexToRemove);
    updateImages(updated);
  };

  return (
    <Box>
      <Box mb="xl" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {images.map((src, index) => (
          <Box key={index} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <img src={src} alt={`Product ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Button
              size="icon"
              variant="danger"
              onClick={() => removeImage(index)}
              style={{ position: 'absolute', top: 0, right: 0, padding: 0, width: '20px', height: '20px', minWidth: '20px' }}
            >
              <span style={{ lineHeight: '10px' }}>x</span>
            </Button>
          </Box>
        ))}
      </Box>

      <DropZone
        multiple
        onChange={fileUpload}
        validate={{
          maxSize: 5024000,
          mimeTypes: ["image/png", "image/jpg", "image/jpeg", "image/webp"],
        }}
        title="Drop images here or click to upload"
      />
    </Box>
  );
};

export default UploadMultipleImage;
