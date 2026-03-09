import { Box, Button, Input, Label, Table, TableBody, TableCell, TableHead, TableRow } from "@adminjs/design-system";
import { useEffect, useRef, useState } from "react";
import { ApiClient } from "adminjs";

const VariantList = (props) => {
    const { record, property } = props;
    const [entries, setEntries] = useState([]);
    const [metalRates, setMetalRates] = useState([]);

    const isMetal = Boolean((property.name && property.name.toLowerCase().includes('metal')) || (property.path && property.path.toLowerCase().includes('metal')));
    const isDiamond = Boolean((property.name && property.name.toLowerCase().includes('diamond')) || (property.path && property.path.toLowerCase().includes('diamond')));

    // Refs for new entry inputs
    const idRef = useRef(null);
    const nameRef = useRef(null);
    const badgeRef = useRef(null);
    const metalRateIdRef = useRef(null);
    const metalWeightRef = useRef(null);
    // Diamond-specific refs
    const diamondRateRef = useRef(null);   // rate per carat (₹)
    const diamondWeightRef = useRef(null); // weight in carats

    useEffect(() => {
        const fetchRates = async () => {
            if (isMetal) {
                const api = new ApiClient();
                try {
                    const response = await api.resourceAction({ resourceId: 'metal_rates', actionName: 'list' });
                    if (response.data && response.data.records) {
                        setMetalRates(response.data.records);
                    }
                } catch (e) {
                    console.error("Failed to fetch metal rates", e);
                }
            }
        };
        fetchRates();
    }, [isMetal]);

    const addItem = () => {
        if (!idRef.current.value.trim() && !nameRef.current.value.trim()) return;

        const updated = [
            ...entries,
            {
                id: idRef.current.value.trim(),
                name: nameRef.current.value.trim(),
                badge: badgeRef.current.value.trim(),
                metalRateId: metalRateIdRef.current ? metalRateIdRef.current.value : '',
                metalWeight: metalWeightRef.current ? metalWeightRef.current.value.trim() : '',
                // Diamond fields
                diamondRate: diamondRateRef.current ? diamondRateRef.current.value.trim() : '',
                diamondWeight: diamondWeightRef.current ? diamondWeightRef.current.value.trim() : '',
            },
        ];
        idRef.current.value = "";
        nameRef.current.value = "";
        badgeRef.current.value = "";
        if (metalRateIdRef.current) metalRateIdRef.current.value = "";
        if (metalWeightRef.current) metalWeightRef.current.value = "";
        if (diamondRateRef.current) diamondRateRef.current.value = "";
        if (diamondWeightRef.current) diamondWeightRef.current.value = "";
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

        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { }
        }

        if (Array.isArray(value)) {
            setEntries(value);
        } else {
            const items = [];
            let i = 0;
            while (true) {
                const id = record.params[`${property.name}.${i}.id`];
                const name = record.params[`${property.name}.${i}.name`];
                const badge = record.params[`${property.name}.${i}.badge`];
                const metalRateId = record.params[`${property.name}.${i}.metalRateId`];
                const metalWeight = record.params[`${property.name}.${i}.metalWeight`];
                const diamondRate = record.params[`${property.name}.${i}.diamondRate`];
                const diamondWeight = record.params[`${property.name}.${i}.diamondWeight`];
                if (id === undefined && name === undefined) break;

                items.push({
                    id: id || '',
                    name: name || '',
                    badge: badge || '',
                    metalRateId: metalRateId || '',
                    metalWeight: metalWeight || '',
                    diamondRate: diamondRate || '',
                    diamondWeight: diamondWeight || '',
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
        const flatParams = {};
        newEntries.forEach((item, index) => {
            flatParams[`${property.name}.${index}.id`] = item.id;
            flatParams[`${property.name}.${index}.name`] = item.name;
            flatParams[`${property.name}.${index}.badge`] = item.badge;
            flatParams[`${property.name}.${index}.metalRateId`] = item.metalRateId;
            flatParams[`${property.name}.${index}.metalWeight`] = item.metalWeight;
            flatParams[`${property.name}.${index}.diamondRate`] = item.diamondRate;
            flatParams[`${property.name}.${index}.diamondWeight`] = item.diamondWeight;
        });

        props.onChange(property.name, newEntries);
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

                {/* Metal-specific fields */}
                {isMetal && (
                    <Box flex={2} flexDirection="row" gap="default" width="100%">
                        <Box flex={1}>
                            <Label variant="light" size="sm">Metal Rate</Label>
                            <select ref={metalRateIdRef} style={{ width: '100%', height: '36px', padding: '0 8px', borderColor: '#c8d1db', borderRadius: '4px' }}>
                                <option value="">Select Rate</option>
                                {metalRates.map(r => (
                                    <option key={r.id} value={r.id}>{r.params.name}</option>
                                ))}
                            </select>
                        </Box>
                        <Box flex={1}>
                            <Label variant="light" size="sm">Weight (g)</Label>
                            <Input ref={metalWeightRef} placeholder="e.g. 3.5" width="100%" />
                        </Box>
                    </Box>
                )}

                {/* Diamond-specific fields */}
                {isDiamond && (
                    <Box flex={2} flexDirection="row" gap="default" width="100%">
                        <Box flex={1}>
                            <Label variant="light" size="sm">Rate per Carat (₹)</Label>
                            <Input ref={diamondRateRef} placeholder="e.g. 5000" width="100%" />
                        </Box>
                        <Box flex={1}>
                            <Label variant="light" size="sm">Weight (Carats)</Label>
                            <Input ref={diamondWeightRef} placeholder="e.g. 0.25" width="100%" />
                        </Box>
                    </Box>
                )}

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
                    {isMetal && (
                        <div key={`hidden-metals-${index}`}>
                            <input type="hidden" name={`${property.name}.${index}.metalRateId`} value={item.metalRateId || ''} />
                            <input type="hidden" name={`${property.name}.${index}.metalWeight`} value={item.metalWeight || ''} />
                        </div>
                    )}
                    {isDiamond && (
                        <div key={`hidden-diamonds-${index}`}>
                            <input type="hidden" name={`${property.name}.${index}.diamondRate`} value={item.diamondRate || ''} />
                            <input type="hidden" name={`${property.name}.${index}.diamondWeight`} value={item.diamondWeight || ''} />
                        </div>
                    )}
                </div>
            ))}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Badge</TableCell>
                        {isMetal && <TableCell>Rate/Weight</TableCell>}
                        {isDiamond && <TableCell>Rate/Weight</TableCell>}
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((item, index) => {
                        const rateName = metalRates.find(r => String(r.id) === String(item.metalRateId))?.params?.name || item.metalRateId;
                        return (
                            <TableRow key={index}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.badge}</TableCell>
                                {isMetal && (
                                    <TableCell>{rateName ? `${rateName} @ ${item.metalWeight}g` : '-'}</TableCell>
                                )}
                                {isDiamond && (
                                    <TableCell>
                                        {item.diamondRate && item.diamondWeight
                                            ? `₹${item.diamondRate}/ct @ ${item.diamondWeight}ct`
                                            : '-'}
                                    </TableCell>
                                )}
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
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
};

export default VariantList;
