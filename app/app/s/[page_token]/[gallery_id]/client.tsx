"use client"

import { Skeleton } from "@mui/material"
import { useEffect, useState } from "react"

export function Image({ src, aspectRatio }: { src: string, aspectRatio: number }) {
    const [error, seterror] = useState(0)
    const [mir, setmir] = useState<string>()
    useEffect(() => {
        setmir(localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io")
    }, [src])

    // onError有时不触发, BUG.md.2
    const Img = (): JSX.Element => {
        switch (error) {
            case 0:
                return <img
                    loading="lazy"
                    className="lazyload blur-up"
                    data-src={`https://${mir}/v7/` + src}
                    style={{ width: "100%", aspectRatio: aspectRatio }}
                    onError={() => seterror(error + 1)}
                />
            default:
                return <img
                    loading="lazy"
                    className="lazyload blur-up"
                    data-src={src}
                    style={{ width: "100%", aspectRatio: aspectRatio }}
                    onError={() => seterror(error + 1)}
                />
        }
    }

    return <>
        {mir ? <Img /> : <Skeleton variant="rectangular" width="100%" height="50vh" />}
    </>
}