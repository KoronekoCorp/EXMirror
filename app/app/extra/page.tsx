"use client"

import { enqueueSnackbar } from "notistack";
import { Get_ip, IP, Link } from "./server";
import { Table, TableHead, TableCell, TableRow, TableBody } from "@mui/material";
import { useState } from "react";


export default function Setting() {
    const [ip, setip] = useState<IP>()
    const [l, setl] = useState<number>()
    const IP = () => {
        Get_ip()
            .then((e) => {
                setip(e)
                enqueueSnackbar("IP信息获取成功", { variant: "success" })
            })
            // .catch((e) => {
            //     enqueueSnackbar(`IP信息获取失败:${e}`, { variant: "error" })
            // })
    }

    const link = () => {
        Link()
            .then((e) => {
                setl(e)
                enqueueSnackbar("连接信息获取成功", { variant: "success" })
            })
            // .catch((e) => {
            //     enqueueSnackbar(`连接信息获取失败:${e}`, { variant: "error" })
            // })
    }


    return <>
        <title>服务器信息</title>
        <div className="card fluid center" style={{ backgroundColor: "#ffefc8" }}>
            <h3>
                <i className="fa fa-server" aria-hidden="true" /> IP地址
            </h3>
        </div>
        <div className="container center" style={{ paddingTop: 10 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ip && Object.keys(ip).map((row) => (
                        <TableRow
                            key={row}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row}
                            </TableCell>
                            <TableCell>{ip[row].toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <button type="button" className="primary" onClick={IP}>
                获取服务器IP信息
            </button>
        </div>
        <div className="card fluid center" style={{ backgroundColor: "#ffefc8" }}>
            <h3>
                <i className="fa fa-server" aria-hidden="true" /> 连接
            </h3>
        </div>
        <div className="container center" style={{ paddingTop: 10 }}>
            <div className="row">
                <div className="col-sm-6">
                    <p>API延迟</p>
                </div>
                <div className="col-sm-6">
                    <p>{l ?? "未测试"}</p>
                </div>
            </div>
            <button type="button" className="primary" onClick={link}>
                获取连接信息
            </button>
        </div>
    </>
}