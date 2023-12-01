"use client"

import { RadioGroup, FormControl, FormLabel, FormControlLabel, Radio, Select, MenuItem } from "@mui/material"
import { useEffect, useState } from "react";
import Cookies from "js-cookie"
import { enqueueSnackbar } from "notistack";
import mirror from './img.json'

export default function Setting() {
    const [fullimg, setfullimg] = useState('false');
    const [img, setimg] = useState("aeiljuispo.cloudimg.io")
    useEffect(() => {
        setfullimg(Cookies.get("fullimg") ?? "false")
        setimg(localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io")
    }, [])


    return <>
        <title>设置</title>
        <div className="card fluid center" style={{ backgroundColor: "#ffefc8" }}>
            <h3>
                <i className="fa fa-cogs" aria-hidden="true" /> 是否加载原图片
            </h3>
        </div>
        <div className="container center" style={{ paddingTop: 10 }}>
            <FormControl component="fieldset">
                <FormLabel component="legend">是否加载原图片</FormLabel>
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
        <div className="card fluid center" style={{ backgroundColor: "#ffefc8" }}>
            <h3>
                <i className="fa fa-picture-o" aria-hidden="true" /> 图片代理
            </h3>
        </div>
        <div className="container center" style={{ paddingTop: 10 }}>
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
    </>
}