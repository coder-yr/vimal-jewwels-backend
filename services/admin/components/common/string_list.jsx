import { Box, Button, Input, Label } from "@adminjs/design-system";
import { useRef, useState, useEffect } from "react";
const CreateStringList = (props) => {
  const { record, property } = props;
  const [items, setItems] = useState([]);
  const inputValue = useRef(null);
  const addItem = () => {
    if (!inputValue.current.value.trim()) return;
    const updated = [...items, inputValue.current.value.trim()];
    inputValue.current.value = "";
    setItems(updated);
    props.record.params[property.name] = updated;
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    props.record.params[property.name] = updated;
  };

  // Load existing data
  useEffect(() => {
    // TODO fix thsi
    console.log("loading called");
    const value = record.params[property.name] || [];
    setItems(Array.isArray(value) ? value : []);
  }, [record.params, property.name]);

  return (
    <Box>
      <Label>{property.label}</Label>
      <Box flex alignItems="center" gap="default">
        <Input ref={inputValue} placeholder="Enter text" />
        <Button
          marginLeft="xl"
          type="button"
          variant="primary"
          onClick={addItem}
        >
          Add
        </Button>
      </Box>

      <Box mt="lg">
        {items.map((item, i) => (
          <Box key={i} flex alignItems="center" mt="sm">
            <span>{item}</span>
            <Button
              marginLeft="xl"
              variant="danger"
              size="sm"
              onClick={() => removeItem(i)}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CreateStringList;
