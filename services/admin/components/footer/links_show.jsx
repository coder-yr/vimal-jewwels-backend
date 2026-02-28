import React from 'react'
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Label } from '@adminjs/design-system'

const LinksShow = (props) => {
  const { record, property } = props

  let links = []

  if (record && record.params && record.params[property.name]) {
    try {
      const data = record.params[property.name]
      // Check if data is already an object/array or needs parsing
      // AdminJS often flattens nested objects in record.params like 'links.0.label', 'links.0.url'
      // But for JSON type with mixed/array it might differ. 
      // Let's try to unflatten or strict parse if it's a string.

      if (Array.isArray(data)) {
        links = data
      } else if (typeof data === 'string') {
        links = JSON.parse(data)
      } else {
        // If AdminJS flattened it (e.g. { '0': { label: '...', url: '...' } })
        links = Object.values(data)
      }
    } catch (e) {
      console.error("Error parsing links for show view", e)
    }
  }

  // Fallback: AdminJS sometimes stores arrays in params as 'propertyName.0.field'
  // If links is empty, let's try to reconstruct from flattened params if possible, 
  // though for 'json' type usually it sends the object.
  // We will stick to the basic check first.

  return (
    <Box mb="xl">
      <Label>{property.label}</Label>
      {links && links.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((link, index) => (
              <TableRow key={index}>
                <TableCell>{link.label}</TableCell>
                <TableCell>{link.url}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box>No links configured</Box>
      )}
    </Box>
  )
}

export default LinksShow
