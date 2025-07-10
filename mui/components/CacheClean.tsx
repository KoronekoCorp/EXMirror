"use client"

import AutorenewIcon from '@mui/icons-material/Autorenew';
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

async function clearServerWorker(url: string) {
    const keys = await caches.keys()
    const c = await Promise.all(keys.map(i => caches.open(i)))
    await Promise.all(c.map(j => j.delete(url, { ignoreVary: true })))
}

export function CacheCleanButton() {
    const router = useRouter()
    const [loading, setl] = useState(false)

    return <Button onClick={async () => {
        setl(true)
        const allow = await (await fetch(`/api/cache${location.pathname}`)).json() as { code: 200 | 404 }
        if (allow.code !== 200) {
            enqueueSnackbar("远程缓存不支持刷新，仅刷新本地缓存", { variant: "warning" })
            await clearServerWorker(location.href)
            setl(false)
            return router.refresh()
        }
        const r = await (await fetch(`/api/cache${location.pathname}`, { method: "POST" })).json() as { code: 200 | 401 | 404 | 500 }
        switch (r.code) {
            case 200:
                await clearServerWorker(location.href)
                router.refresh()
                enqueueSnackbar("远程刷新成功，本地刷新中", { variant: "success" })
                break
            case 401:
                enqueueSnackbar("远程刷新失败，异常请求", { variant: "warning" })
                break
            case 404:
                await clearServerWorker(location.href)
                router.refresh()
                enqueueSnackbar("远程拒绝刷新，本地刷新中", { variant: "info" })
                break
            case 500:
                enqueueSnackbar("远程刷新失败，服务器错误", { variant: "error" })
                break
        }
        setl(false)

    }} variant="contained" startIcon={<AutorenewIcon />} color="warning" disabled={loading}>
        刷新缓存
    </Button>
}

export function CacheCleanIconButton() {
    const router = useRouter()
    const [loading, setl] = useState(false)

    return <IconButton onClick={async () => {
        setl(true)
        const allow = await (await fetch(`/api/cache${location.pathname}`)).json() as { code: 200 | 404 }
        if (allow.code !== 200) {
            enqueueSnackbar("远程缓存不支持刷新，仅刷新本地缓存", { variant: "warning" })
            await clearServerWorker(location.href)
            setl(false)
            return router.refresh()
        }
        const r = await (await fetch(`/api/cache${location.pathname}`, { method: "POST" })).json() as { code: 200 | 401 | 404 | 500 }
        switch (r.code) {
            case 200:
                await clearServerWorker(location.href)
                router.refresh()
                enqueueSnackbar("远程刷新成功，本地刷新中", { variant: "success" })
                break
            case 401:
                enqueueSnackbar("远程刷新失败，异常请求", { variant: "warning" })
                break
            case 404:
                await clearServerWorker(location.href)
                router.refresh()
                enqueueSnackbar("远程拒绝刷新，本地刷新中", { variant: "info" })
                break
            case 500:
                enqueueSnackbar("远程刷新失败，服务器错误", { variant: "error" })
                break
        }
        setl(false)
    }} color="inherit" disabled={loading}>
        <AutorenewIcon />
    </IconButton>
}