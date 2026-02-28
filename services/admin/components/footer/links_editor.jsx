import React, { useState, useEffect } from 'react'
import { Box, Button, Input, Label, Icon } from '@adminjs/design-system'

const LinksEditor = (props) => {
    const { record, property, onChange } = props
    const [links, setLinks] = useState([])

    useEffect(() => {
        if (record && record.params && record.params[property.name]) {
            try {
                const data = record.params[property.name]
                if (Array.isArray(data)) {
                    setLinks(data)
                } else if (typeof data === 'string') {
                    setLinks(JSON.parse(data))
                }
            } catch (e) {
                console.error("Error parsing links", e)
            }
        }
    }, [record.params[property.name]]) // Only re-run if the specific property changes

    const addLink = () => {
        const newLinks = [...links, { label: '', url: '' }]
        setLinks(newLinks)
        updateRecord(newLinks)
    }

    const removeLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index)
        setLinks(newLinks)
        updateRecord(newLinks)
    }

    const handleChange = (index, field, value) => {
        const newLinks = [...links]
        newLinks[index][field] = value
        setLinks(newLinks)
        updateRecord(newLinks)
    }

    const updateRecord = (newLinks) => {
        onChange(property.name, newLinks)
    }

    return (
        <Box mb="xl">
            <Label>{property.label}</Label>
            {links.map((link, index) => (
                <Box key={index} flex flexDirection="row" mb="sm" alignItems="center">
                    <Box flexGrow={1} mr="sm">
                        <Label>Label</Label>
                        <Input
                            value={link.label}
                            onChange={(e) => handleChange(index, 'label', e.target.value)}
                        />
                    </Box>
                    <Box flexGrow={1} mr="sm">
                        <Label>URL</Label>
                        <Input
                            value={link.url}
                            onChange={(e) => handleChange(index, 'url', e.target.value)}
                        />
                    </Box>
                    <Box mt="lg">
                        <Button size="icon" variant="danger" onClick={() => removeLink(index)} type="button">
                            <Icon icon="Trash2" />
                        </Button>
                    </Box>
                </Box>
            ))}
            <Button onClick={addLink} type="button" variant="primary">
                <Icon icon="Plus" /> Add Link
            </Button>
        </Box>
    )
}

export default LinksEditor
