import React from "react";
import { Box, H2, H4, Text, Button, Icon } from "@adminjs/design-system";
import { styled } from '@adminjs/design-system/styled-components';

const Card = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  transition: transform 0.2s;
  cursor: pointer;
  border: 1px solid #eee;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    border-color: #009999;
  }
`;

const Dashboard = () => {
  return (
    <Box p="xl">
      <Box position="relative" overflow="hidden" bg="white" p="xl" style={{ borderRadius: '8px', borderLeft: '5px solid #009999', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <H2 mt="lg">Welcome to Vimal Jewellers Admin</H2>
        <Text>
          Manage your products, orders, and content from this central dashboard.
        </Text>
      </Box>

      <Box mt="xxl">
        <H4 mb="lg">Quick Actions</H4>
        <Box
          grid
          gridTemplateColumns={['1fr', '1fr', '1fr 1fr 1fr']}
          gridGap="xl"
        >
          <Card as="a" href="/resources/orders">
            <Box flex flexDirection="row" alignItems="center" mb="lg">
              <Icon icon="ShoppingBag" size={32} color="#009999" />
              <H4 ml="lg" my="0">Orders</H4>
            </Box>
            <Text>View and manage customer orders.</Text>
          </Card>

          <Card as="a" href="/resources/products">
            <Box flex flexDirection="row" alignItems="center" mb="lg">
              <Icon icon="Heart" size={32} color="#009999" />
              <H4 ml="lg" my="0">Products</H4>
            </Box>
            <Text>Manage your jewelry catalog.</Text>
          </Card>

          <Card as="a" href="/resources/users">
            <Box flex flexDirection="row" alignItems="center" mb="lg">
              <Icon icon="Users" size={32} color="#009999" />
              <H4 ml="lg" my="0">Users</H4>
            </Box>
            <Text>Manage registered customers.</Text>
          </Card>
          <Card as="a" href="/resources/inquiries">
            <Box flex flexDirection="row" alignItems="center" mb="lg">
              <Icon icon="MessageCircle" size={32} color="#009999" />
              <H4 ml="lg" my="0">Inquiries</H4>
            </Box>
            <Text>Check customer inquiries.</Text>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
