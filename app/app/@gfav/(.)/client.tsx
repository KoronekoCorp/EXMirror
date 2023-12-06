"use client"
import { type CSSProperties, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, Backdrop, Fade, Box, Button, FormControl, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, Grid, TextField } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { add } from './server'

/**
 * 模态
 * @param index 序列号，唯一
 * @returns 
 */
export default function ModalS({ children, index }: { children: JSX.Element[] | JSX.Element, index: string }) {
    const [open, setOpen] = useState(true)
    const router = useRouter()
    useEffect(() => {
        setOpen(true)
    }, [index])


    if (index == null) { return <></> }

    return (
        <Modal open={open}
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            onClose={() => { setOpen(false); setTimeout(router.push, 500, document.location.origin + document.location.pathname) }}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute' as 'absolute',
                    top: '55%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'auto',
                    height: 'auto',
                    bgcolor: 'background.paper',
                    // border: '2px solid #000',
                    boxShadow: 24,
                    borderRadius: '20px',
                    p: 4,
                    zIndex: 10000
                }}>
                    {children}
                </Box>
            </Fade>
        </Modal>)
}

/**
 * 对话框
 * @param index 序列号，唯一
 * @returns 
 */
export function Dig({ title, children, index, actions }:
    {
        title: string | JSX.Element, children: JSX.Element[] | JSX.Element, index: string,
        actions: Array<{ name: string, func: (close: () => void) => any | Promise<any>, style: CSSProperties }>
    }) {
    const [open, setOpen] = useState(true)
    const router = useRouter()
    useEffect(() => {
        setOpen(true)
    }, [index])

    if (index == null) { return <></> }
    const handleClose = () => {
        setOpen(false); setTimeout(router.back)
    }

    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
            {title}
        </DialogTitle>
        <DialogContent style={{ margin: "auto" }}>
            {children}
        </DialogContent>
        <DialogActions>
            {actions.map(i => <Button onClick={() => i.func(handleClose)} color="primary" key={i.name} style={i.style}>
                {i.name}
            </Button>)}
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
        </DialogActions>
    </Dialog>
}

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
        <Grid container alignItems="center" className="center">
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