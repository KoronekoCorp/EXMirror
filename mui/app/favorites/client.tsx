"use client"

import { Container, GridLegacy as Grid, IconButton, TextField } from "@mui/material"
import { useRouter } from "next/navigation"
import { useState } from "react"
import SearchIcon from '@mui/icons-material/Search';

export default function Search() {
    const router = useRouter()
    const [word, setWord] = useState("")

    return <Container sx={{ textAlign: 'center' }}>
        <TextField label="Search" variant="outlined" fullWidth
            onChange={(e) => { setWord(e.target.value) }}
            InputProps={{
                endAdornment: <IconButton onClick={(e) => {
                    e.preventDefault()
                    const u = new URL(location.href)
                    u.searchParams.delete("next")
                    u.searchParams.delete("prev")
                    u.searchParams.set("f_search", word)
                    router.push(u.href)
                }}>
                    <SearchIcon sx={{ color: 'action.active' }} />
                </IconButton>
            }} />
        <Grid container>
        </Grid>
    </Container>
}