import { Box, Button, Input, Label } from "@adminjs/design-system";
import { useEffect, useRef, useState } from "react";
const SizeChart = (props) => {
  const { record, property } = props;
  const [entries, setEntries] = useState([]);
  const sizeRef = useRef(null);
  const bustRef = useRef(null);
  const waistRef = useRef(null);
  const hipRef = useRef(null);
  const addItem = () => {
    if (!sizeRef.current.value.trim()) return;
    if (!bustRef.current.value.trim()) return;
    if (!waistRef.current.value.trim()) return;
    if (!hipRef.current.value.trim()) return;
    const updated = [
      ...entries,
      {
        size: `${sizeRef.current.value.trim()}`,
        bust: `${bustRef.current.value.trim()}`,
        waist: `${waistRef.current.value.trim()}`,
        hip: `${hipRef.current.value.trim()}`,
      },
    ];
    sizeRef.current.value = "";
    bustRef.current.value = "";
    waistRef.current.value = "";
    hipRef.current.value = "";
    setEntries(updated);
    props.record.params[property.name] = updated;
  };

  const removeEntry = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    props.record.params[property.name] = updated;
  };

  // Load existing data
  useEffect(() => {
    // TODO fix this
    console.log("loading called");
    const value = record.params[property.name] || [];
    setEntries(Array.isArray(value) ? value : []);
  }, [record.params, property.name]);

  return (
    <Box>
      <Label>{property.label}</Label>
      <Box flex alignItems="center" gap="default">
        <Input ref={sizeRef} placeholder="Enter Size" />
        <Input
          ref={bustRef}
          type="number"
          placeholder="Enter bust in inches"
          mx="xl"
        />
        <Input
          ref={waistRef}
          type="number"
          placeholder="Enter waist in inches"
        />
        <Input
          type="number"
          ref={hipRef}
          placeholder="Enter hip in inches"
          marginLeft="xl"
        />
        <Button
          marginLeft="xl"
          type="button"
          variant="primary"
          onClick={addItem}
        >
          Add
        </Button>
      </Box>

      <Box mt="lg" marginBottom="xl">
        {entries.map((item, index) => (
          <Box
            key={index}
            flex
            justifyContent="space-between"
            alignItems="center"
            mt="sm"
          >
            <span>
              <strong>{item["size"]}</strong>: {item["bust"]} : {item["waist"]}{" "}
              : {item["hip"]}
            </span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeEntry(index)}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SizeChart;
