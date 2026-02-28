import React from 'react'
import { Box, Text, Header } from '@adminjs/design-system'

const OrderAddress = (props) => {
    const { record } = props
    const addressString = record.params.address

    let address = {}
    try {
        address = addressString ? JSON.parse(addressString) : {}
    } catch (e) {
        // Sometimes it might be stored as plain string or null
        return <Text>{addressString || 'No address provided'}</Text>
    }

    if (Object.keys(address).length === 0) {
        return <Text>No address details found.</Text>
    }

    return (
        <Box p="xl" bg="white" border="default">
            {/* <Header.H5>Shipping Address</Header.H5> */}
            <Box mb="lg">
                <Text fontWeight="bold">{address.firstName} {address.lastName}</Text>
                <Text>{address.addressLine1}</Text>
                {address.addressLine2 && <Text>{address.addressLine2}</Text>}
                <Text>{address.city}, {address.state} {address.pincode}</Text>
                {address.country && <Text>{address.country}</Text>}
            </Box>
            <Box>
                <Text><strong>Phone:</strong> {address.phone}</Text>
                <Text><strong>Email:</strong> {address.email}</Text>
            </Box>
        </Box>
    )
}

export default OrderAddress
