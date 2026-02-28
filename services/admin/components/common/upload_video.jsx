import React from 'react';
import { Box, DropZone } from "@adminjs/design-system";
import axios from "axios";
import { serverUrlApi, serverUrlImage } from "../constants";

const UploadVideo = (props) => {
    const { property, onChange, record } = props;
    const [preview, setPreview] = React.useState(record.params[property.name]);

    const fileUpload = async (file) => {
        if (file.length === 1) {
            const url = `${serverUrlApi}upload/video`;
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

                        // Note: serverUrlImage points to /images, where we stored the video too.
                        // If we had a separate folder, we'd need a separate URL variable.
                        // But since we stored in "images", this works.
                        const videoUrl = `${serverUrlImage}${response.data["filename"]}`;

                        // Update record params
                        record.params[property.name] = videoUrl;

                        // Update preview
                        setPreview(videoUrl);

                        // Trigger AdminJS change event
                        onChange(property.name, videoUrl);
                    }
                })
                .catch((error) => {
                    console.error("Upload failed:", error);
                    alert("Video upload failed. Check console for details.");
                });
        }
    };
    return (
        <Box>
            <DropZone
                onChange={fileUpload}
                validate={{
                    maxSize: 50 * 1024 * 1024, // 50MB limit
                    mimeTypes: ["video/mp4", "video/webm", "video/ogg"],
                }}
            ></DropZone>
            {preview && (
                <Box mt="xl">
                    <video src={preview} controls width="300px" />
                </Box>
            )}
        </Box>
    );
};

export default UploadVideo;
