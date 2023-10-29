"use client"
import { Box, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { enqueueSnackbar } from "notistack"

export default function Login() {
    const [ipb_member_id, setipb_member_id] = useState("")
    const [ipb_pass_hash, setipb_pass_hash] = useState("")
    const [igneous, setigneous] = useState("")

    useEffect(() => {
        setipb_member_id(Cookies.get("ipb_member_id") ?? "")
        setipb_pass_hash(Cookies.get("ipb_pass_hash") ?? "")
        setigneous(Cookies.get("igneous") ?? "")
    }, [])

    const login = () => {
        document.cookie = `ipb_member_id=${ipb_member_id}; max-age=604800; path=/`;
        document.cookie = `ipb_pass_hash=${ipb_pass_hash}; max-age=604800; path=/`;
        document.cookie = `igneous=${igneous}; max-age=604800; path=/`;
        enqueueSnackbar('登录成功', { variant: 'success' });
    }

    return <>
        <div className="card fluid center" style={{ backgroundColor: "#ffefc8" }}>
            <h2>
                <i className="fa fa-sign-in" aria-hidden="true"></i> 登录
            </h2>
        </div>
        <div className="container center col-sm-12 col-md-6" style={{ padding: 20 }}>
            <Box sx={{
                '& > :not(style)': { m: 1, width: '50ch' },
            }}>
                <TextField id="outlined-basic" label="ipb_member_id" variant="outlined" style={{ boxSizing: 'unset' }} type="ipb_member_id" fullWidth
                    value={ipb_member_id}
                    onChange={(e) => { setipb_member_id(e.target.value) }} />

                <TextField id="outlined-basic" label="ipb_pass_hash" variant="outlined" style={{ boxSizing: 'unset' }} type="ipb_pass_hash" fullWidth
                    value={ipb_pass_hash}
                    onChange={(e) => { setipb_pass_hash(e.target.value) }} />

                <TextField id="outlined-basic" label="igneous" variant="outlined" style={{ boxSizing: 'unset' }} type="ipb_member_id" fullWidth
                    value={igneous}
                    onChange={(e) => { setigneous(e.target.value) }} />

            </Box>
            <button type="button" className="primary" onClick={login}>
                登录
            </button>
        </div>
    </>
}