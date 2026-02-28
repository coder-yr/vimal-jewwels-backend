import React from 'react';

const ViewSingleImage = (props) => {
  const { record } = props;
  const imageUrl = record.params.image;
  // TODO on click pr bada view dikega
  return imageUrl ? (
    <img
      src={imageUrl}
      alt="image"
      style={{ width: "40px", height: "40px", borderRadius: "10%" }}
    />
  ) : (
    <span>No Image</span>
  );
};

export default ViewSingleImage;
