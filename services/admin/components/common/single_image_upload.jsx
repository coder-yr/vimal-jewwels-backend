import React from 'react';
import { Box, DropZone } from "@adminjs/design-system";
import axios from "axios";
import { serverUrlApi, serverUrlImage } from "../constants";
const UploadSingleImage = (props) => {
  const { property, onChange, record } = props;
  const [preview, setPreview] = React.useState(record.params[property.name]);

  const fileUpload = async (file) => {
    if (file.length === 1) {
      const url = `${serverUrlApi}upload/image`;
      const formData = new FormData();
      formData.append("file", file[0]);
      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
      };
      axios
        .post(url, formData, config)
        .then((response) => {
          if (response.status === 200) {
            console.log("Upload success:", response.data["filename"]);
            const imageUrl = `${serverUrlImage}${response.data["filename"]}`;

            // Update record params
            record.params[property.name] = imageUrl;

            // Update preview
            setPreview(imageUrl);

            // Trigger AdminJS change event
            onChange(property.name, imageUrl);
          }
        })
        .catch((error) => {
          console.error("Upload failed:", error);
          alert("Image upload failed. Check console for details.");
        });
    }
  };
  return (
    <Box>
      <DropZone
        onChange={fileUpload}
        validate={{
          maxSize: 5024000,
          mimeTypes: ["image/png", "image/jpg", "image/jpeg"],
        }}
      ></DropZone>
      {preview && (
        <Box mt="xl">
          <img src={preview} alt="Preview" width="100px" />
        </Box>
      )}
    </Box>
  );
};

export default UploadSingleImage;
