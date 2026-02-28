import { Box, Button, Input, Label, Table, TableBody, TableCell, TableHead, TableRow } from "@adminjs/design-system";
import { useEffect, useRef, useState } from "react";

const PriceBreakupList = (props) => {
    const { record, property, onChange } = props;
    const [entries, setEntries] = useState([]);

    // Refs for new entry inputs
    const labelRef = useRef(null);
    const amountRef = useRef(null);
    const originalRef = useRef(null);

    const addItem = () => {
        if (!labelRef.current.value.trim() && !amountRef.current.value.trim()) return;

        const updated = [
            ...entries,
            {
                label: labelRef.current.value.trim(),
                amount: amountRef.current.value.trim(), // e.g. "₹45,000"
                original: originalRef.current.value.trim(), // e.g. "₹50,000"
            },
        ];
        labelRef.current.value = "";
        amountRef.current.value = "";
        originalRef.current.value = "";
        setEntries(updated);
        updateAdminJS(updated);
    };

    const removeEntry = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
        updateAdminJS(updated);
    };

    // Load existing data
    useEffect(() => {
        let value = record.params[property.name];

        // If it's a JSON string
        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { }
        }

        if (Array.isArray(value)) {
            setEntries(value);
        } else {
            // Check for flattened params: priceBreakup.0.label
            const items = [];
            let i = 0;
            while (true) {
                const label = record.params[`${property.name}.${i}.label`];
                const amount = record.params[`${property.name}.${i}.amount`];
                const original = record.params[`${property.name}.${i}.original`];

                if (label === undefined && amount === undefined) break;

                items.push({
                    label: label || '',
                    amount: amount || '',
                    original: original || ''
                });
                i++;
            }
            if (items.length > 0) {
                setEntries(items);
            } else {
                setEntries([]);
            }
        }
    }, [record.params, property.name]);

    const updateAdminJS = (newEntries) => {
        // Send as array to main property
        onChange(property.name, newEntries);
    };

    return (
        <Box>
            <Label>{property.label}</Label>
            <Box flex flexDirection="row" gap="default" alignItems="flex-end" mb="lg">
                <Box flex={2}>
                    <Label variant="light" size="sm">Label (e.g. Making Charges)</Label>
                    <Input ref={labelRef} placeholder="Label" width="100%" />
                </Box>
                <Box flex={1}>
                    <Label variant="light" size="sm">Amount (e.g. ₹45,000)</Label>
                    <Input ref={amountRef} placeholder="Value" width="100%" />
                </Box>
                <Box flex={1}>
                    <Label variant="light" size="sm">Original (Optional)</Label>
                    <Input ref={originalRef} placeholder="Strikethrough" width="100%" />
                </Box>
                <Box>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={addItem}
                    >
                        Add
                    </Button>
                </Box>
            </Box>

            {/* Hidden inputs to ensure flattened keys are submitted */}
            {entries.map((item, index) => (
                <div key={`hidden-${index}`} style={{ display: 'none' }}>
                    <input type="hidden" name={`${property.name}.${index}.label`} value={item.label || ''} />
                    <input type="hidden" name={`${property.name}.${index}.amount`} value={item.amount || ''} />
                    <input type="hidden" name={`${property.name}.${index}.original`} value={item.original || ''} />
                </div>
            ))}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Original</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.label}</TableCell>
                            <TableCell>{item.amount}</TableCell>
                            <TableCell>{item.original}</TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    type="button"
                                    onClick={() => removeEntry(index)}
                                >
                                    Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default PriceBreakupList;
