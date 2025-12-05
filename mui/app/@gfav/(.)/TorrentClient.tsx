"use client"
import Link from "@/components/LinkFix";
import { Dig } from '@/components/Modals';
import { Checkbox, Divider, Link as LinkC, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { useState } from "react";

interface torrent {
    Posted: string;
    Size: string;
    Seeds: string;
    Peers: string;
    Downloads: string;
    Uploader: string;
    publicUrl: string;
    privateUrl: string;
    Name: string;
}

export function TorrentClient({ torrent, params: { gallery_id, gallery_token } }: { torrent: torrent[], params: { gallery_id: string, gallery_token: string } }) {
    const [selected, setSelected] = useState<boolean[]>(Array.from({ length: torrent.length }, () => false));

    return <Dig index={gallery_id} title="选择你要下载的种子" actions={[
        {
            name: "下载私有种子", func(close) {
                selected.map((i, j) => (i ? torrent[j].privateUrl : null)).filter(i => i !== null) //@ts-ignore ide没反应编译器报错
                    .map(i => window.open(i, "_blank"))
                close()
            },
        },
        {
            name: "下载可再分发种子", func(close) {
                selected.map((i, j) => (i ? torrent[j].publicUrl : null)).filter(i => i !== null) //@ts-ignore ide没反应编译器报错
                    .map(i => window.open(i, "_blank"))
                close()
            },
        }
    ]} sx={{ zIndex: 2002 }}>
        <Stack spacing={{ xs: 0, sm: 1 }} divider={<Divider orientation="vertical" flexItem />} sx={{ justifyContent: "center", alignItems: "flex-start" }} >
            {torrent.map((i, j) => {
                return <ListItemButton onClick={() => { const tmp = [...selected]; tmp[j] = !tmp[j]; setSelected(tmp) }}>
                    <Checkbox edge="start" disableRipple checked={selected[j]} />
                    <ListItemText primary={i.Name} secondary={<>
                        由 <LinkC component={Link} href={`/uploader/${i.Uploader}`}>{i.Uploader}</LinkC> 发布于 {i.Posted}
                        <br />
                        文件大小:{i.Size} 做种:{i.Seeds} 下载:{i.Peers} 完成:{i.Downloads}
                    </>} />
                </ListItemButton>
            })}
            <Typography variant="body2">私有种子(只属于您 - 确保记录您的下载统计信息)<br />可再分发种子(如果您想再发布或提供给其他人使用)</Typography>
        </Stack>
    </Dig>
}

