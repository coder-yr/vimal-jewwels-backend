import React, { useState } from 'react'
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Text, Badge, Button, Icon } from '@adminjs/design-system'

const UserOrders = (props) => {
    const { record } = props

    // We expect orders to be populated in record.populated.orders
    // Or passed via a custom property if manually populated into params (as JSON) which is safer for large lists
    // But for now let's assume we populate it into a virtual property 'ordersList'

    const orders = record.populated && record.populated.orders ? record.populated.orders : []

    if (!orders || orders.length === 0) {
        return (
            <Box p="xl" border="default" bg="white">
                <Text textAlign="center">No orders found for this user.</Text>
            </Box>
        )
    }

    return (
        <Box variant="white">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Details</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell><Text>{order.id}</Text></TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>₹{order.total ? order.total.toLocaleString("en-IN") : 0}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    order.status === 'Delivered' ? 'success' :
                                        order.status === 'Cancelled' ? 'danger' :
                                            order.status === 'Shipped' ? 'info' : 'primary'
                                }>{order.status}</Badge>
                            </TableCell>
                            <TableCell>{order.paymentMethod}</TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="text"
                                    onClick={() => window.location.href = `/resources/orders/records/${order.id}/show`}
                                >
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    )
}

export default UserOrders
