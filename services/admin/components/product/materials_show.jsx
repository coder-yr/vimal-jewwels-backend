
import { Box, Badge, Label } from "@adminjs/design-system";
import React from "react";

const MaterialsShow = (props) => {
    const { record, property } = props;

    // robust extraction of data
    let items = [];

    // 1. Check Populated (Best case: Objects with names)
    if (record.populated && record.populated[property.name]) {
        items = record.populated[property.name];
    }
    // 2. Check Params (Array of IDs or Objects)
    else if (record.params[property.name]) {
        const val = record.params[property.name];
        if (Array.isArray(val)) {
            items = val;
        } else {
            items = [val]; // Single item?
        }
    }
    // 3. Check Flattened Params (materials.0, materials.1 etc.)
    else {
        let i = 0;
        while (true) {
            // Check for ID or straightforward value
            const val = record.params[`${property.name}.${i}`] || record.params[`${property.name}.${i}.id`];
            if (!val) break;
            items.push(val);
            i++;
        }
    }

    // Debug info in UI if empty
    const debugInfo = items.length === 0 ? `(Empty. Params: ${JSON.stringify(record.params[property.name] || 'undefined')})` : '';

    return (
        <Box>
            <Label>{property.label}</Label>
            {items.length > 0 ? (
                <Box flex gap="default">
                    {items.map((item, index) => (
                        <Badge key={index} variant="primary">
                            {item.name || item.title || item.id || item}
                        </Badge>
                    ))}
                </Box>
            ) : (
                <Box color="grey60" fontStyle="italic">
                    No materials found. {debugInfo}
                </Box>
            )}
        </Box>
    );
};

export default MaterialsShow;
