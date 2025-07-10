"use client"

import { enqueueSnackbar } from "notistack";
import { Get_ip, IP, Link } from "./server";
import { Table, TableHead, TableCell, TableRow, TableBody, Typography, Button, GridLegacy as Grid } from "@mui/material";
import { useState } from "react";
import StorageIcon from '@mui/icons-material/Storage';

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
        <Grid container
            justifyContent="center"
            alignItems="stretch"
            sx={{
                textAlign: "center",
                color: "text.primary",
                paddingTop: 10,
            }}
            spacing={2}>
            <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ backgroundColor: "background.paper" }}>
                    <StorageIcon />IP地址
                </Typography>
                <Table sx={{ "th": { textAlign: 'center' }, "td": { textAlign: 'center' } }}>
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
                <Button variant="contained" onClick={IP} sx={{ m: 3 }}>
                    获取服务器IP信息
                </Button>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ backgroundColor: "background.paper" }}>
                    <StorageIcon />连接
                </Typography>
                <div className="container center" style={{ paddingTop: 10 }}>
                    <div className="row">
                        <div className="col-sm-6">
                            <p>API延迟</p>
                        </div>
                        <div className="col-sm-6">
                            <p>{l ?? "未测试"}</p>
                        </div>
                    </div>

                </div>
                <Button variant="contained" onClick={link} sx={{ m: 3 }}>
                    获取连接信息
                </Button>
            </Grid>
        </Grid>
    </>
}