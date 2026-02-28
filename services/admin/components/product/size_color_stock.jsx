import { Box, Button, Input, Label, Select } from "@adminjs/design-system";
import { useEffect, useRef, useState } from "react";

const SizeColorStock = (props) => {
  const { record, property } = props;

  // Manual unflatten helper to retrieve initial data from flat params
  const getInitialEntries = () => {
    const params = record.params || {};
    const baseKey = property.name;

    // 1. If it exists as an array (JSON/Mixed handled by AdminJS)
    if (params[baseKey] && Array.isArray(params[baseKey])) {
      return params[baseKey];
    }
    // 2. If it's an object acting as array
    if (params[baseKey] && typeof params[baseKey] === 'object') {
      return Object.values(params[baseKey]);
    }

    // 3. Try to unflatten manually (sizes.0.size, sizes.1.size, etc.)
    const extracted = [];
    let i = 0;
    while (true) {
      // Check for existence of any key for this index
      const sizeKey = `${baseKey}.${i}.size`;
      const availKey = `${baseKey}.${i}.availabilityStatus`;

      // If we find a size or availability, we assume the row exists
      // Note: checking `params[sizeKey] !== undefined` is safer
      if (params[sizeKey] !== undefined || params[availKey] !== undefined) {
        extracted.push({
          size: params[`${baseKey}.${i}.size`] || "",
          diameter: params[`${baseKey}.${i}.diameter`] || "",
          availabilityStatus: params[`${baseKey}.${i}.availabilityStatus`] || "Made to Order",
          color: params[`${baseKey}.${i}.color`] || "",
          colorName: params[`${baseKey}.${i}.colorName`] || "",
          stock: params[`${baseKey}.${i}.stock`] || "0",
        });
        i++;
      } else {
        break;
      }
    }
    return extracted;
  };

  const [entries, setEntries] = useState(getInitialEntries);

  // Input States
  const [size, setSize] = useState("");
  const [diameter, setDiameter] = useState("");
  const [color, setColor] = useState("");
  const [colorName, setColorName] = useState("");
  const [stock, setStock] = useState("");
  const [availability, setAvailability] = useState("Made to Order");

  const addItem = () => {
    if (!size.trim()) return;

    const updated = [
      ...entries,
      {
        size: size.trim(),
        diameter: diameter.trim(),
        availabilityStatus: availability,
        color: color.trim(),
        colorName: colorName.trim(),
        stock: stock.trim() || "0",
      },
    ];

    // Clear inputs
    setSize("");
    setDiameter("");
    setColor("");
    setColorName("");
    setStock("");
    setAvailability("Made to Order");

    setEntries(updated);

    // Update AdminJS record
    // Direct mutation can be helpful for AdminJS internals sometimes
    if (props.record.params) {
      props.record.params[property.name] = updated;
    }
    if (props.onChange) {
      props.onChange(property.name, updated);
    }
  };

  const removeEntry = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);

    if (props.record.params) {
      props.record.params[property.name] = updated;
    }
    if (props.onChange) {
      props.onChange(property.name, updated);
    }
  };

  // Load existing data
  // useEffect(() => {
  //   const value = record.params[property.name];
  //   // AdminJS might flatten arrays to objects with numeric keys, e.g. { '0': {...}, '1': {...} }
  //   // We need to handle that.
  //   if (Array.isArray(value)) {
  //     setEntries(value);
  //   } else if (typeof value === 'object' && value !== null) {
  //     // Convert object-like array (AdminJS quirk) to true array
  //     // But normally onChange expects the array. ensure persistence works.
  //     // If coming from DB as JSON, it safely parses to array.
  //     setEntries(Object.values(value));
  //   } else {
  //     setEntries([]);
  //   }
  // }, [record.params[property.name]]); // user property.name to avoid deep dependency issues

  return (
    <Box>
      <Label>{property.label}</Label>
      <Box flex alignItems="end" gap="default" flexWrap="wrap">
        <Box width={1 / 6} minWidth="100px">
          <Label variant="light" size="sm">Size</Label>
          <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="Size" width="100%" />
        </Box>
        <Box width={1 / 6} minWidth="100px">
          <Label variant="light" size="sm">Dia (mm)</Label>
          <Input value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="Diameter" width="100%" />
        </Box>
        <Box width={1 / 6} minWidth="150px">
          <Label variant="light" size="sm">Availability</Label>
          <Select
            value={{ value: availability, label: availability }}
            onChange={(selected) => setAvailability(selected.value)}
            options={[
              { value: "Made to Order", label: "Made to Order" },
              { value: "In Stock", label: "In Stock" },
            ]}
          />
        </Box>
        <Box width={1 / 6} minWidth="100px">
          <Label variant="light" size="sm">Color Code</Label>
          <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#000" width="100%" />
        </Box>
        <Box width={1 / 6} minWidth="100px">
          <Label variant="light" size="sm">Color Name</Label>
          <Input value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="Gold" width="100%" />
        </Box>
        <Box width={1 / 6} minWidth="80px">
          <Label variant="light" size="sm">Qty</Label>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            width="100%"
          />
        </Box>
        <Box pb="sm">
          <Button
            type="button"
            variant="primary"
            onClick={addItem}
          >
            Add
          </Button>
        </Box>
      </Box>

      <Box mt="lg" marginBottom="xl">
        {entries.length > 0 ? (
          entries.map((item, index) => (
            <Box
              key={index}
              flex
              justifyContent="space-between"
              alignItems="center"
              mt="sm"
              p="default"
              bg="grey20"
              style={{ borderRadius: '4px' }}
            >
              <span>
                <strong>Size: {item.size}</strong>
                {item.diameter && ` | ${item.diameter} mm`}
                {item.availabilityStatus && ` | ${item.availabilityStatus}`}
                {item.colorName && ` | ${item.colorName}`}
                {item.stock && ` | Qty: ${item.stock}`}
              </span>
              <Button
                size="sm"
                variant="danger"
                ml="default"
                onClick={() => removeEntry(index)}
              >
                Remove
              </Button>
            </Box>
          ))
        ) : (
          <Box p="default" bg="grey20" style={{ borderRadius: '4px', fontStyle: 'italic', color: '#888' }}>
            No sizes added yet.
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SizeColorStock;
