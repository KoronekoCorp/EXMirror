"use client"

import { AutoSearch } from "@/components/AutoSearch"
import { Container } from "@mui/material"

export default function S() {
    return <Container>
        <AutoSearch baseurl="/i" />
    </Container>
}