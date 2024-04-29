"use client"

import CachedIcon from '@mui/icons-material/Cached';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ImageIcon from '@mui/icons-material/Image';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, FormControl, FormControlLabel, FormLabel, Grid, MenuItem, Radio, RadioGroup, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, styled } from "@mui/material";
import Cookies from "js-cookie";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import ColorSetting from "./Color";
import mirror from './img.json';

const H2 = styled("h2")(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#e5dfdf',
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.mode === 'dark' ? '#ffffff' : 'black',
    borderRadius: 12,
    margin: theme.spacing(1)
}));

export default function Setting() {
    const [fullimg, setfullimg] = useState('false');
    const [img, setimg] = useState("aeiljuispo.cloudimg.io")
    const [data, setdata] = useState<{ key: string; length: number; }[]>([])
    const [CacheStatus, setCS] = useState(false)

    async function cache() {
        const r = await navigator.serviceWorker.getRegistrations()
        if (r.length > 0) {
            setCS(true)
        } else {
            setCS(false)
        }
        const keys = await caches.keys()
        setdata(await Promise.all(keys.map(async i => {
            const t = await caches.open(i)
            return {
                key: i,
                length: (await t.keys()).length
            }
        })))
    }

    function key(k: string) {
        switch (k) {
            case "cross-origin":
                return k + "(引用文件)"
            case "pages-rsc":
                return k + "(动态数据)"
            case "pages-rsc-prefetch":
                return k + "(预加载)"
            case "next-static-css-assets":
                return k + "(静态文件)"
            case "next-static-js-assets":
                return k + "(静态文件)"
            case "static-data-assets":
                return k + "(静态数据)"
            case "static-image-assets":
                return k + "(图片缓存)"
            case "pages":
                return k + "(页面缓存)"
            default:
                return k
        }
    }

    useEffect(() => {
        setfullimg(Cookies.get("fullimg") ?? "false")
        setimg(localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io")
        cache()
    }, [])


    return <>
        <title>设置</title>
        <Grid container sx={{ color: "text.primary", textAlign: "center", }}
            justifyContent="center"
            alignItems="stretch" spacing={2}>

            <Grid item xs={12} md={6}>
                <H2>
                    <SettingsIcon /> 是否加载原图
                </H2>
                <div style={{ padding: 10 }}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ color: 'inherit' }}>是否加载原图片</FormLabel>
                        <RadioGroup onChange={(e) => {
                            setfullimg(e.target.value);
                            document.cookie = `fullimg=${e.target.value}; max-age=604800; path=/`;
                            enqueueSnackbar("图片设置已保存", { variant: 'info' })
                        }} value={fullimg}>
                            <FormControlLabel value="true" control={<Radio />} label="是" />
                            <FormControlLabel value="false" control={<Radio />} label="否(默认)" />
                        </RadioGroup>
                    </FormControl>
                </div>
                <H2>
                    <CachedIcon /> 缓存控制
                </H2>
                <Stack direction="row" spacing={2} justifyContent="center" useFlexGap flexWrap="wrap">
                    <p>当前缓存服务</p>
                    <Button variant="outlined" color={CacheStatus ? "success" : "error"} onClick={async () => {
                        if (CacheStatus) {
                            localStorage.setItem("noSw", "true")
                            const r = await navigator.serviceWorker.getRegistrations()
                            await Promise.all(r.map(i => i.unregister()))
                            enqueueSnackbar(`已尝试注销服务进程`, { variant: 'info' })
                        } else {
                            localStorage.setItem("noSw", "false")
                            await navigator.serviceWorker.register("/sw.js")
                            enqueueSnackbar(`已尝试注册服务进程`, { variant: 'info' })
                        }
                        cache()
                    }}>
                        {CacheStatus ? "已启用" : "未启用"}
                    </Button>
                </Stack>

                <div style={{ padding: 10 }}>
                    <Table sx={{ "th": { textAlign: 'center' }, "td": { textAlign: 'center' } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>储存桶</TableCell>
                                <TableCell>总数</TableCell>
                                <TableCell>管理</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow
                                    key={row.key}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        {key(row.key)}
                                    </TableCell>
                                    <TableCell>{row.length}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="warning" onClick={async () => {
                                            const status = await caches.delete(row.key)
                                            cache()
                                            if (status) {
                                                enqueueSnackbar(`${row.key}清除成功`, { variant: 'success' })
                                            } else {
                                                enqueueSnackbar(`${row.key}清除失败`, { variant: 'error' })
                                            }
                                        }}>
                                            清空
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button variant="contained" sx={{ m: 3 }} color="error" onClick={async () => {
                        await Promise.all(data.map(async i => caches.delete(i.key)))
                        cache()
                        enqueueSnackbar(`已清空`, { variant: 'info' })
                    }}>
                        全部清空
                    </Button>
                </div>
            </Grid>

            <Grid item xs={12} md={6}>
                <H2>
                    <ImageIcon />图片代理
                </H2>
                <div style={{ paddingTop: 10 }}>
                    <p>请注意，图片代理质量越高会导致加载速度的变慢，请均衡选择</p>
                    <p>代理列表数据生成于2024.4.29,<a href="https://github.com/KoronekoCorp/Tools">使用此工具生成</a></p>
                    <FormControl>
                        <Select
                            autoFocus
                            value={img}
                            onChange={(e) => {
                                // document.cookie = `mirror=${e.target.value}; max-age=604800; path=/`;
                                localStorage.setItem("mirror", e.target.value)
                                setimg(e.target.value)
                                enqueueSnackbar("图片代理已保存", { variant: 'info' })
                            }}>
                            <MenuItem value="aeiljuispo.cloudimg.io">默认 aeiljuispo.cloudimg.io</MenuItem>
                            {mirror.map(i => <MenuItem value={i.name} key={i.name}>{i.name} 质量{i.length}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <p>请注意下述图片能否正常加载</p>
                    <img src={`https://${img}/v7/https://koroneko.co/img/1.png`}
                        loading="lazy"
                        className="lazyload blur-up"
                        style={{ width: "50%", }}
                        onError={() => { enqueueSnackbar("图片加载失败", { variant: "error" }) }}
                    />
                </div>
            </Grid>
            <Grid item xs={12} md={12}>
                <H2>
                    <ColorLensIcon />主题配色
                </H2>
                <div style={{ paddingTop: 10 }}>
                    <ColorSetting />
                </div >
            </Grid>
        </Grid>
    </>
}