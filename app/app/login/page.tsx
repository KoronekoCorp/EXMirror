"use client"
import { Box, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { enqueueSnackbar } from "notistack"
import { change_setting, get_setting } from "./server"

export default function Login() {
    const [ipb_member_id, setipb_member_id] = useState("")
    const [ipb_pass_hash, setipb_pass_hash] = useState("")
    const [igneous, setigneous] = useState("")

    useEffect(() => {
        setipb_member_id(Cookies.get("ipb_member_id") ?? "")
        setipb_pass_hash(Cookies.get("ipb_pass_hash") ?? "")
        setigneous(Cookies.get("igneous") ?? "")
    }, [])

    const setcookie = (cookies: string[]) => {
        cookies.forEach((c) => {
            const [key, value] = c.split(";")[0].split("=")
            document.cookie = `${key}=${value}; max-age=31536000; path=/`;
        })
    }

    const check_setting = (setting: [string, FormDataEntryValue][]): [boolean, URL] => {
        let error = false
        const u = new URL(document.location.href)
        for (let i in setting) {
            u.searchParams.set(setting[i][0], setting[i][1].toString())
            switch (setting[i][0]) {
                case "ts":
                    if (setting[i][1].toString() !== "1") {
                        u.searchParams.set("ts", "1")
                        error = true
                    }
                    break
                case "dm":
                    if (setting[i][1].toString() !== "2") {
                        u.searchParams.set("dm", "2")
                        error = true
                    }
                    break
            }
            u.searchParams.set("apply", "应用")
        }
        return [error, u]
    }

    const login = () => {
        document.cookie = `ipb_member_id=${ipb_member_id}; max-age=31536000; path=/`;
        document.cookie = `ipb_pass_hash=${ipb_pass_hash}; max-age=31536000; path=/`;
        document.cookie = `igneous=${igneous}; max-age=31536000; path=/`;
        enqueueSnackbar('登录成功', { variant: 'success' });
        enqueueSnackbar('正在获取账户设置,请勿刷新', { variant: 'info' });
        get_setting()
            .then((e) => {
                const { setting, cookies } = e
                setcookie(cookies)
                const [error, u] = check_setting(setting)
                if (error) {
                    enqueueSnackbar(`账户设置存在问题,正在自动修改`, { variant: 'info' });
                    change_setting(u.search.slice(1))
                        .then((e) => {
                            const { setting, cookies } = e
                            setcookie(cookies)
                            const [error, u] = check_setting(setting)
                            if (error) {
                                enqueueSnackbar(`修改账户设置失败`, { variant: 'error' });
                            } else {
                                enqueueSnackbar(`修改账户设置成功`, { variant: 'success' });
                            }
                        })
                        .catch((e) => {
                            enqueueSnackbar(`修改账户设置失败:${e}`, { variant: 'error' });
                        })
                } else {
                    enqueueSnackbar(`账户设置正常`, { variant: 'success' });
                }
            })
            .catch((e) => {
                enqueueSnackbar(`获取账户设置失败:${e}`, { variant: 'error' });
            })
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