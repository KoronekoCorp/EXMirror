"use client"

import { RadioGroup, FormControl, FormLabel, FormControlLabel, Radio, Select, MenuItem, styled, Grid } from "@mui/material"
import { useEffect, useState } from "react";
import Cookies from "js-cookie"
import { enqueueSnackbar } from "notistack";
import mirror from './img.json'
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';

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
    useEffect(() => {
        setfullimg(Cookies.get("fullimg") ?? "false")
        setimg(localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io")
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
                <div style={{ paddingTop: 10 }}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ color: 'inherit' }}>是否加载原图片</FormLabel>
                        <RadioGroup aria-label="fullimg" name="fullimg" onChange={(e) => {
                            setfullimg(e.target.value);
                            document.cookie = `fullimg=${e.target.value}; max-age=604800; path=/`;
                            enqueueSnackbar("图片设置已保存", { variant: 'info' })
                        }} value={fullimg}>
                            <FormControlLabel value="true" control={<Radio />} label="是" />
                            <FormControlLabel value="false" control={<Radio />} label="否(默认)" />
                        </RadioGroup>
                    </FormControl>
                </div>
            </Grid>

            <Grid item xs={12} md={6}>
                <H2>
                    <ImageIcon />图片代理
                </H2>
                <div style={{ paddingTop: 10 }}>
                    <p>请注意，图片代理质量越高会导致加载速度的变慢，请均衡选择</p>
                    <p>代理列表数据生成于2023.11.29,<a href="https://github.com/KoronekoCorp/Tools">使用此工具生成</a></p>
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
        </Grid>
    </>
}