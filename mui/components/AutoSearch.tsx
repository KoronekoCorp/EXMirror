"use client"

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { Grid, Typography } from '@mui/material';

interface item {
    key: string
    name: string,
    intro?: string,
    links?: string,
}

export function AutoSearch() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<item[]>([]);
    const [inputValue, setvalue] = useState('');
    const [data, setdata] = useState<item[]>([])
    const loading = open && inputValue != "" && options.length === 0


    return (
        <Autocomplete
            multiple
            fullWidth
            autoComplete
            autoSelect
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
                setOptions([])
            }}
            onChange={(e, v) => setdata(v)}
            onInputChange={async (e, v) => {
                setvalue(v)
                if (v == "") return
                const r = await (await fetch(`/api/db/${v}`)).json() as item[]
                r.unshift({ name: v, key: v })
                setOptions(r)
            }}
            filterOptions={(option, state) => {
                console.log(option, state)
                const fin: item[] = []
                for (const i of option) {
                    if (i.key.includes(state.inputValue) || i.name.includes(state.inputValue)) {
                        fin.push(i)
                    }
                }
                return fin
            }}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            getOptionLabel={(option) => option.key}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    key={params.id}
                    {...params}
                    label="Search"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading && <CircularProgress color="inherit" />}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => {
                return <li {...props}>
                    <Grid container alignItems="center">
                        {/* <Grid item sx={{ display: 'flex', width: 44 }}>
                    <LocationOnIcon sx={{ color: 'text.secondary' }} />
                  </Grid> */}
                        {/* <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}> */}
                        {/* {parts.map((part, index) => (
                                <Box
                                    key={index}
                                    component="span"
                                    sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
                                >
                                    {part.text}
                                </Box>
                            ))} */}
                        <Typography variant="body2" color="text.secondary" component={"div"} dangerouslySetInnerHTML={{ __html: option.name }}>

                        </Typography>
                        {/* </Grid> */}
                    </Grid>
                </li>
            }}
        />
    );
}