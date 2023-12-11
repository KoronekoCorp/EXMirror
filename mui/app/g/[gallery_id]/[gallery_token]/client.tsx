"use client"

import { type ginfo } from "@/Data/EXJSDOM"
import { Accordion, AccordionDetails, AccordionSummary, LinearProgress, List, Divider, ListItem, ListItemButton, ListItemText, Box, Tab, Tabs, TextField, Button } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Dig } from "@/components/Modals"
import { enqueueSnackbar } from "notistack"
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export function NextPage({ gallery_id, gallery_token, p }: { gallery_id: string, gallery_token: string, p: number }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const router = useRouter()

    const init = () => {
        var observer = new IntersectionObserver((entries) => {
            entries.forEach(item => {
                /*
                 * item.time发生相交到相应的时间，毫秒
                 * item.rootBounds：根元素矩形区域的信息，如果没有设置根元素则返回 null，图中蓝色部分区域。
                 * item.boundingClientRect：目标元素的矩形区域的信息，图中黑色边框的区域。
                 * item.intersectionRect：目标元素与视口（或根元素）的交叉区域的信息，图中蓝色方块和粉红色方块相交的区域。
                 * item.isIntersecting：目标元素与根元素是否相交
                 * item.intersectionRatio：目标元素与视口（或根元素）的相交比例。
                 * item.target：目标元素，图中黑色边框的部分。
                 */
                if (item.isIntersecting) {
                    observer.disconnect()
                    router.push(`/g/${gallery_id}/${gallery_token}?p=${p + 1}`)
                }
            })
        });
        setTimeout(() => {
            if (ref.current) {
                observer.observe(ref.current)
            }
        }, 5000);
        return () => observer.disconnect()
    }

    useEffect(() => init(), [gallery_id, gallery_token, p])

    return <div style={{ padding: 10 }} ref={ref}>
        <LinearProgress />
    </div>
}

export function Reply({ gdata }: { gdata: ginfo }) {
    const [id, setid] = useState<number>()
    const [tab, settab] = useState(0);
    const [input, setinput] = useState("")

    const notfinish = () => {
        enqueueSnackbar("功能尚未完成", { variant: 'warning' })
    }

    return <Accordion sx={{ m: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            评论
        </AccordionSummary>
        <AccordionDetails>
            <List>
                <ListItem>
                    <Box sx={{ width: "100%", "& > :not(style)": { m: 1 } }}>
                        <Tabs value={tab} onChange={(e, v) => { settab(v) }}>
                            <Tab label="Write" value={0} />
                            <Tab label="Preview" value={1} />
                        </Tabs>
                        {tab === 0 && <TextField
                            label="Reply"
                            multiline
                            rows={4}
                            defaultValue={input}
                            fullWidth
                            onChange={(e) => { setinput(e.target.value) }}>
                        </TextField>}
                        {tab === 1 && <p dangerouslySetInnerHTML={{ __html: input }}></p>}
                        <Button variant="contained" endIcon={<SendIcon />} onClick={notfinish}>
                            Send
                        </Button>
                    </Box>
                </ListItem>
                {gdata.comments.data.map((i, j) => <div key={i.id}>
                    <Divider />
                    <ListItem alignItems="flex-start" >
                        <ListItemButton onClick={() => { setid(j) }}>
                            <ListItemText
                                primary={i.name}
                                secondary={<p style={{ wordBreak: 'break-word' }} dangerouslySetInnerHTML={{
                                    __html: i.text + `<b>${i.score}</b>`
                                }}></p>}
                                sx={{ "b": { ml: 2 } }}
                            />
                        </ListItemButton>
                    </ListItem>
                </div>)}
            </List>
        </AccordionDetails>
        {id !== undefined && <Dig
            title={gdata.comments.data[id].name} index={Date.now().toString()}
            actions={[
                {
                    name: "深表赞同",
                    func: (c) => { c(); notfinish() }
                },
                {
                    name: "垃圾评论",
                    func: (c) => { c(); notfinish() }
                }
            ]}
            closeAction={(r) => { setid(undefined) }}
            sx={{ zIndex: 2002 }}>
            <Box sx={{ "p": { wordBreak: 'break-word' } }}>
                <p dangerouslySetInnerHTML={{
                    __html: gdata.comments.data[id].text
                }} />
                <p dangerouslySetInnerHTML={{
                    __html: gdata.comments.data[id].scorelog
                }} />
            </Box>
        </Dig>}
    </Accordion>
}