
import React, { useState, useEffect } from "react";
import { Box, Header, Tabs, Tab, Button, Badge, Label, Table, TableHead, TableRow, TableCell, TableBody, Icon } from "@adminjs/design-system";
import { ApiClient } from "adminjs";

// A simple component to list related items and allow quick navigation/add
const MegaMenuShow = (props) => {
    const { record, resource, action } = props;
    const [activeTab, setActiveTab] = useState("styles");
    const [lists, setLists] = useState({
        styles: [],
        materials: [],
        shopFor: [],
        occasions: []
    });
    const [loading, setLoading] = useState(false);

    const api = new ApiClient();

    const fetchRelated = async (resourceId, key) => {
        try {
            // Query the resource where megaCategoryId = record.id
            const response = await api.resourceAction({
                resourceId: resourceId,
                actionName: 'list',
                query: {
                    // Fetch ALL records (up to 5000) and filter client-side.
                    // This bypasses any backend filtering issues.
                    // Add timestamp to bust cache
                    perPage: 5000,
                    _t: Date.now()
                }
            });

            // DEBUG LOGS
            console.log(`[${resourceId}] Querying for MegaCatID: ${record.id}`);
            console.log(`[${resourceId}] Raw Response Records:`, response.data.records.length);
            if (response.data.records.length > 0) {
                console.log(`[${resourceId}] Sample Record 0 params:`, response.data.records[0].params);
                console.log(`[${resourceId}] Sample Record 0 populated:`, response.data.records[0].populated);
            }

            // Robust Linkage Check:
            const filtered = response.data.records.filter(r => {
                const rawId = r.params.megaCategoryId;
                const popId = r.populated && r.populated.megaCategoryId && r.populated.megaCategoryId.id;
                const targetId = record.id;

                const match = String(rawId) === String(targetId) || String(popId) === String(targetId);

                // Debug specific failures for Rings (ID 2 usually)
                if (!match && String(targetId) === '2') {
                    // Check if it's one of the missing items (28, 30, 31, 32)
                    const pid = String(r.params.id);
                    if (['28', '30', '31', '32'].includes(pid)) {
                        console.log(`[${resourceId}] FAIL: Item ${pid} (${r.params.name}) failed match.`);
                        console.log(`   rawId: ${rawId} (${typeof rawId})`);
                        console.log(`   popId: ${popId} (${typeof popId})`);
                        console.log(`   targetId: ${targetId} (${typeof targetId})`);
                    }
                }
                return match;
            });

            console.log(`[${resourceId}] Filtered Count: ${filtered.length}`);
            return filtered;
        } catch (err) {
            console.error(`Error fetching ${resourceId}`, err);
            return [];
        }
    };

    const loadAll = async () => {
        setLoading(true);
        const [styles, materials, shopFors, occasions] = await Promise.all([
            fetchRelated('styles', 'styles'),
            fetchRelated('materials', 'materials'),
            fetchRelated('shopfor', 'shopFor'),
            fetchRelated('occasions', 'occasions') // Using clean ID 'occasions'
        ]);
        setLists({ styles, materials, shopFor: shopFors, occasions });
        setLoading(false);
    };

    useEffect(() => {
        if (record && record.id) {
            loadAll();
        }
    }, [record.id]);

    const renderList = (key, items, resourceId) => {
        return (
            <Box py="xl">
                <Box flex justifyContent="space-between" alignItems="center" mb="lg">
                    <Header.H4>{key.charAt(0).toUpperCase() + key.slice(1)} ({items.length})</Header.H4>
                    <Box flex gap="default">
                        <Button onClick={loadAll} variant="light" disabled={loading} size="icon">
                            <Icon icon="RefreshCcw" />
                        </Button>
                        <Button as="a" href={`/resources/${resourceId === 'shopFor' ? 'shopfor' : resourceId}/actions/new?megaCategoryId=${record.id}`}>
                            <Icon icon="Plus" /> Add New {key.slice(0, -1)}
                        </Button>
                    </Box>
                </Box>

                {items.length === 0 && <Box>No items found.</Box>}

                {items.length > 0 && (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name/Price</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.params.id}</TableCell>
                                    <TableCell>
                                        {item.params.name ||
                                            (item.params.startPrice ? `${item.params.startPrice} - ${item.params.endPrice}` : 'N/A')}
                                    </TableCell>
                                    <TableCell>
                                        {item.params.active ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="icon" as="a" href={`/resources/${resourceId === 'shopFor' ? 'shopfor' : resourceId}/records/${item.id}/edit`}>
                                            <Icon icon="Edit2" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Box>
        );
    };

    return (
        <Box>
            <Box variant="white" p="xl" mb="xl">
                <Header.H3>Mega Menu: {record.params.name}</Header.H3>
            </Box>

            <Box variant="white" p="xl">
                <Tabs currentTab={activeTab} onChange={setActiveTab}>
                    <Tab id="styles" label="Styles" />
                    <Tab id="materials" label="Materials" />
                    <Tab id="shopFor" label="Shop For" />
                    <Tab id="occasions" label="Occasions" />
                </Tabs>

                <Box>
                    {activeTab === 'styles' && renderList('styles', lists.styles, 'styles')}
                    {activeTab === 'materials' && renderList('materials', lists.materials, 'materials')}
                    {activeTab === 'shopFor' && renderList('shopFor', lists.shopFor, 'shopFor')}
                    {activeTab === 'occasions' && renderList('occasions', lists.occasions, 'occasions')}
                </Box>
            </Box>
        </Box>
    );
};

export default MegaMenuShow;
