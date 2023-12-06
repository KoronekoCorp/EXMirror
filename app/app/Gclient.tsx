"use client"

import { useRouter } from "next/navigation"


export function FavButton({ name, url, style }: { name: string, url: string, style: any }) {
    const router = useRouter()

    return <button className="shadowed small" style={style} onClick={() => {
        const d = url.split("/")
        // const u = new URL(document.location.origin + "/fav")
        const u = new URL(document.location.href)
        u.searchParams.set("gallery_id", d[4])
        u.searchParams.set("gallery_token", d[5])
        router.push(u.href)
    }}>
        {name}
    </button>
}