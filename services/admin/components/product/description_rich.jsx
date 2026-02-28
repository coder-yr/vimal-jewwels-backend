import { Box, Label, RichTextEditor } from "@adminjs/design-system";
import { useState, useEffect } from "react";

const DescriptionRichText = (props) => {
  const { record, property, onChange } = props;

  // Initialize from record.params, fallback to empty string
  // Use state to manage the editor content locally
  const initialValue = record.params && record.params[property.name] ? record.params[property.name] : "";
  const [value, setValue] = useState(initialValue);

  // Sync validation or external changes (optional, but good for reset)
  // Only update if record value changes significantly and is different from local (avoid loops)
  useEffect(() => {
    const recordValue = record.params[property.name] || "";
    if (recordValue !== value && !value) {
      // Only sync from record if local is empty (initial load scenario)
      // This prevents overwriting user typing if parent re-renders with old data
      setValue(recordValue);
    }
  }, [record.params, property.name]);

  const handleChange = (content) => {
    setValue(content);
    if (onChange) {
      // Propagate to AdminJS form state
      onChange(property.name, content);
    } else {
      // Fallback for older versions or custom implementations
      record.params[property.name] = content;
    }
  };

  return (
    <Box marginBottom="xl">
      <Label>{property.label}</Label>
      <RichTextEditor
        value={value}
        onChange={handleChange}
      />
    </Box>
  );
};

export default DescriptionRichText;



