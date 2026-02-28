import { Box, Button, Input, Label, Table, TableBody, TableCell, TableHead, TableRow } from "@adminjs/design-system";
import { useEffect, useRef, useState } from "react";

const VariantList = (props) => {
    const { record, property } = props;
    const [entries, setEntries] = useState([]);

    // Refs for new entry inputs
    const idRef = useRef(null);
    const nameRef = useRef(null);
    const badgeRef = useRef(null);

    const addItem = () => {
        if (!idRef.current.value.trim() && !nameRef.current.value.trim()) return;

        const updated = [
            ...entries,
            {
                id: idRef.current.value.trim(),
                name: nameRef.current.value.trim(),
                badge: badgeRef.current.value.trim(),
            },
        ];
        idRef.current.value = "";
        nameRef.current.value = "";
        badgeRef.current.value = ""; // Optional
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

        // If it's a JSON string?
        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { }
        }

        if (Array.isArray(value)) {
            setEntries(value);
        } else {
            // Check for flattened params: availableMetals.0.id
            const items = [];
            let i = 0;
            while (true) {
                const id = record.params[`${property.name}.${i}.id`];
                const name = record.params[`${property.name}.${i}.name`];
                const badge = record.params[`${property.name}.${i}.badge`];
                if (id === undefined && name === undefined) break; // Stop if no more
                // If it's a deleted item (maybe AdminJS sends undefined?), skip? 
                // Actually AdminJS usually keeps indices sequential or we just accept what is there.
                // But initially record.params should have the data.

                // If ID or Name exists, add it
                items.push({
                    id: id || '',
                    name: name || '',
                    badge: badge || ''
                });
                i++;
            }
            // If items found via flattening, use them
            if (items.length > 0) {
                setEntries(items);
            } else {
                setEntries([]);
            }
        }
    }, [record.params, property.name]);

    // Update AdminJS state when entries change
    // We use a separate useEffect/function to trigger onChange, 
    // BUT we must be careful not to trigger infinite loops if we depend on record.params
    // So we'll trigger onChange only on user actions (addItem, removeItem)

    const updateAdminJS = (newEntries) => {
        // We need to update flattened keys: property.name.index.field
        // And also potentially clear old indices if array shrank?
        // Actually, easier to sending the whole array if supported, but let's flatten.

        // 1. Flatten new entries
        const flatParams = {};
        newEntries.forEach((item, index) => {
            flatParams[`${property.name}.${index}.id`] = item.id;
            flatParams[`${property.name}.${index}.name`] = item.name;
            flatParams[`${property.name}.${index}.badge`] = item.badge;
        });

        // 2. Call onChange for each key? No, that's too many renders.
        // AdminJS onChange usually accepts (path, value).
        // If we want to batch, we might need to access the record directly or use specific AdminJS hooks.
        // But the standard prop is onChange(path, value).

        // To avoid spamming, let's try sending the ARRAY to the main property name.
        // Many AdminJS adapters accept this for JSON/Mixed fields.
        props.onChange(property.name, newEntries);

        // Also update flattened keys? 
        // If we send the array to property.name, AdminJS usually handles it if type is 'mixed' + 'isArray'.
    };


    return (
        <Box>
            <Label>{property.label}</Label>
            <Box flex flexDirection="row" gap="default" alignItems="flex-end" mb="lg">
                <Box flex={1}>
                    <Label variant="light" size="sm">ID (e.g. 18k-rose)</Label>
                    <Input ref={idRef} placeholder="ID" width="100%" />
                </Box>
                <Box flex={1}>
                    <Label variant="light" size="sm">Name (e.g. 18K Rose Gold)</Label>
                    <Input ref={nameRef} placeholder="Name" width="100%" />
                </Box>
                <Box flex={1}>
                    <Label variant="light" size="sm">Badge (e.g. Made to Order)</Label>
                    <Input ref={badgeRef} placeholder="Badge" width="100%" />
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

            {/* Hidden inputs for form submission */}
            {entries.map((item, index) => (
                <div key={`hidden-${index}`}>
                    <input type="hidden" name={`${property.name}.${index}.id`} value={item.id || ''} />
                    <input type="hidden" name={`${property.name}.${index}.name`} value={item.name || ''} />
                    <input type="hidden" name={`${property.name}.${index}.badge`} value={item.badge || ''} />
                </div>
            ))}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Badge</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.badge}</TableCell>
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

export default VariantList;
