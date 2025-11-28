"use client"
import { type G_JSDOM_DATA } from "@/Data/EXJSDOM";
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import StarIcon from '@mui/icons-material/Star';
import Button from '@mui/material/Button';
import CardActions from "@mui/material/CardActions";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SetBackDrop } from "./BackDrop";
import Link from "./LinkFix";
import InsertLinkIcon from '@mui/icons-material/InsertLink'

const format_style = (style: string) => {
    const d = style.split(";").map((e) => e.split(":"))
    const s: { [key: string]: string } = {}
    d.forEach((e) => {
        switch (e[0]) {
            case "border-color":
                s["borderColor"] = e[1]
                break
            case "background":
                s["background"] = e[1].replace("!important", "")
                break
            case "background-color":
                s["backgroundColor"] = e[1]
                break
            default:
                s[e[0]] = e[1]
        }
    })
    return s
}

export function Gbutton({ e }: { e: G_JSDOM_DATA }) {
    const setopen = useContext(SetBackDrop)
    const router = useRouter()

    return <CardActions sx={{ "& > a": { ml: 1, mr: 1 } }}>
        <Button size="small" LinkComponent={Link} href={`/${e.catalog.toLocaleLowerCase().replaceAll(" ", "")}`} color="primary" startIcon={<DataSaverOffIcon />}>
            {e.catalog}
        </Button>
        <Button size="small" startIcon={<StarIcon />} sx={format_style(e.favstyle)}
            onClick={() => {
                setopen(true)
                const d = e.href.split("/")
                // const u = new URL(document.location.origin + "/fav")
                const u = new URL(document.location.href)
                u.searchParams.set("gallery_id", d[4])
                u.searchParams.set("gallery_token", d[5])
                u.searchParams.set("type", "fav")
                router.push(u.href, { scroll: false })
            }}>
            {e.favname == "" ? "收藏" : e.favname}
        </Button>
        <Button size="small" startIcon={<InsertLinkIcon />} disabled={!e.hasTorrent} onClick={() => {
            setopen(true)
            const d = e.href.split("/")
            // const u = new URL(document.location.origin + "/fav")
            const u = new URL(document.location.href)
            u.searchParams.set("gallery_id", d[4])
            u.searchParams.set("gallery_token", d[5])
            u.searchParams.set("type", "torrent")
            router.push(u.href, { scroll: false })
        }}>
            种子
        </Button>
    </CardActions>

}

export function Filtered() {
    const router = useRouter()

    return <Button size="small" startIcon={<FilterAltOffIcon />}
        onClick={() => {
            const u = new URL(document.location.href)
            u.searchParams.set("f_sft", "on")
            u.searchParams.set("f_sfu", "on")
            u.searchParams.set("f_sfl", "on")
            router.push(u.href)
        }}>
        禁用过滤器
    </Button>
}

export default { Filtered, Gbutton }