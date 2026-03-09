
import React from "react";
import { Box, Header, Text } from "@adminjs/design-system";

// A simplified component for Mega Category view after removal of sub-resources
const MegaMenuShow = (props) => {
    const { record } = props;

    return (
        <Box>
            <Box variant="white" p="xl" mb="xl">
                <Header.H3>Mega Category: {record.params.name}</Header.H3>
            </Box>

            <Box variant="white" p="xl">
                <Text>
                    The sub-resources (Styles, Materials, Shop For, and Occasions) have been removed from the Mega Menu configuration.
                    Please manage categories directly from the Categories resource.
                </Text>
            </Box>
        </Box>
    );
};

export default MegaMenuShow;

