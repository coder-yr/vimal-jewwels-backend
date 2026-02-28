import React from 'react'
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Text, Badge } from '@adminjs/design-system'
import { serverUrlImage } from '../constants.js'

const OrderItems = (props) => {
    const { record, where } = props
    const itemsRaw = record.params.items

    let items = []
    try {
        if (Array.isArray(itemsRaw)) {
            items = itemsRaw;
        } else if (typeof itemsRaw === 'string') {
            items = JSON.parse(itemsRaw);
        } else if (typeof itemsRaw === 'object' && itemsRaw !== null) {
            items = Object.values(itemsRaw);
        }
    } catch (e) {
        // console.error("Error parsing items:", e);
    }

    if (!items || items.length === 0) {
        return <Text>-</Text>
    }

    // List View Summary
    if (where === 'list') {
        const names = items.map(i => i.name).join(", ");
        return (
            <Box>
                <Badge variant="info">{items.length} Item{items.length !== 1 ? 's' : ''}</Badge>
                <Text fontSize="xs" mt="sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    {names}
                </Text>
            </Box>
        )
    }

    // Detail/Show View
    return (
        <Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => {
                        // Handle Image URL
                        let imageUrl = item.image;
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            // Trim leading slash if needed to avoid double slashes if serverUrl has one
                            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
                            // Ensure serverUrlImage ends with slash or handle it. 
                            // Usually serverUrlImage is "http://url/images/"
                            imageUrl = `${serverUrlImage}${cleanPath}`;
                        }

                        return (
                            <TableRow key={index}>
                                <TableCell>
                                    <Box flex flexDirection="row" alignItems="center">
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt={item.name}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px', borderRadius: '6px', border: '1px solid #eee' }}
                                            />
                                        )}
                                        <Box>
                                            <Text fontWeight="bold">{item.name}</Text>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        {item.ringSize && <Badge variant="primary" mr="sm" mb="sm">Size: {item.ringSize}</Badge>}
                                        {item.metal && <Text fontSize="sm" color="grey60">Metal: {item.metal}</Text>}
                                        {item.diamond && <Text fontSize="sm" color="grey60">Diamond: {item.diamond}</Text>}
                                        {item.purity && <Text fontSize="sm" color="grey60">Purity: {item.purity}</Text>}
                                    </Box>
                                </TableCell>
                                <TableCell><Text fontSize="sm">{item.sku || '-'}</Text></TableCell>
                                <TableCell><Text fontWeight="bold">{item.qty}</Text></TableCell>
                                <TableCell>{item.price ? `₹${item.price.toLocaleString("en-IN")}` : '-'}</TableCell>
                                <TableCell>{item.price && item.qty ? `₹${(item.price * item.qty).toLocaleString("en-IN")}` : '-'}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Box>
    )
}

export default OrderItems
