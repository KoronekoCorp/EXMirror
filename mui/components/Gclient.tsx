"use client"
import { type G_JSDOM_DATA } from "@/Data/EXJSDOM";
import Button from '@mui/material/Button'
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SetBackDrop } from "./BackDrop";

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
    const router = useRouter()
    const setopen = useContext(SetBackDrop)

    return <>
        <Button size="small" startIcon={<StarIcon />} sx={format_style(e.favstyle)}
            onClick={() => {
                setopen(true)
                const d = e.href.split("/")
                // const u = new URL(document.location.origin + "/fav")
                const u = new URL(document.location.href)
                u.searchParams.set("gallery_id", d[4])
                u.searchParams.set("gallery_token", d[5])
                router.push(u.href)
            }}>
            {e.favname == "" ? "收藏" : e.favname}
        </Button>
    </>
}