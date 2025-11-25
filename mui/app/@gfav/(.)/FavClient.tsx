"use client"
import { useState } from 'react'
import { FormControl, Select, MenuItem, GridLegacy as Grid, TextField } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { add } from './server'
import { Dig } from '@/components/Modals'


export function Favlist({ fav, favs, favmsg, params: { gallery_id, gallery_token } }: { fav: string, favs: string[], favmsg: string, params: { gallery_id: string, gallery_token: string } }) {
    const [v, setv] = useState(`${parseInt(fav) - 1}`)
    const [msg, setm] = useState(favmsg)

    const Save = async (close: () => void) => {
        close()
        if (Number.isNaN(parseInt(v))) {
            enqueueSnackbar("未收藏,不进行操作", { variant: "warning" })
            return
        }
        if (msg.length >= 200) {
            enqueueSnackbar("备注过长", { variant: "warning" })
            return
        }
        if (await add(gallery_id, gallery_token, v, msg)) {
            enqueueSnackbar("收藏成功", { variant: "success" })
        } else {
            enqueueSnackbar("收藏失败", { variant: "error" })
        }
    }

    const del = async (close: () => void) => {
        close()
        if (await add(gallery_id, gallery_token, "favdel", "")) {
            enqueueSnackbar("删除成功", { variant: "success" })
        } else {
            enqueueSnackbar("删除失败", { variant: "error" })
        }
    }

    return <Dig index={fav} title="收藏" actions={[
        { name: "保存", func: Save, style: { backgroundColor: "#0277bd", color: "white" } },
        { name: "删除收藏", func: del, style: { backgroundColor: "red", color: "white" } }
    ]}>
        <Grid container alignItems="center">
            <Grid item xs={12}>
                <FormControl>
                    <Select
                        autoFocus
                        value={v}
                        onChange={(e) => { setv(e.target.value) }}>
                        {favs.map((i, j) => <MenuItem value={j} key={i}>{i}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ paddingTop: 2 }}>
                <TextField id="outlined-basic"
                    label="收藏备注" variant="outlined"
                    helperText="(最多 200 字符)"
                    style={{ boxSizing: 'unset' }} type="fav_msg" fullWidth
                    value={msg} onChange={(e) => { setm(e.target.value) }} />
            </Grid>
        </Grid>
    </Dig>
}

