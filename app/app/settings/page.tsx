"use client"

import { RadioGroup, FormControl, FormLabel, FormControlLabel, Radio } from "@mui/material"
import { useEffect, useState } from "react";
import Cookies from "js-cookie"
import { enqueueSnackbar } from "notistack";


export default function Setting() {
    const [value, setValue] = useState('false');

    useEffect(() => {
        setValue(Cookies.get("fullimg") ?? "false")
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
                    setValue(e.target.value);
                    document.cookie = `fullimg=${e.target.value}; max-age=604800; path=/`;
                    enqueueSnackbar("数据库设置已保存", { variant: 'info' })
                }} value={value}>
                    <FormControlLabel value="true" control={<Radio />} label="是" />
                    <FormControlLabel value="false" control={<Radio />} label="否(默认)" />
                </RadioGroup>
            </FormControl>
        </div >
    </>
}