"use client"

import { Skeleton } from "@mui/material"
import { useState } from "react"

export function Image({ src }: { src: string }) {
    const [isloaded, setload] = useState(false)
    const [error, seterror] = useState(0)

    const get_url = (): string => {
        switch (error) {
            case 0:
                return "https://aeiljuispo.cloudimg.io/" + src
            default:
                return src
        }
    }

    return <>
        <img
            id="pic_cover"
            loading="lazy"
            className="lazyload blur-up"
            data-src={get_url()}
            onLoad={() => setload(true)}
            style={{ width: "100%" }}
            onError={() => seterror(error + 1)}
        />
        {!isloaded && <Skeleton variant="rectangular" width="100%" height="800px" />}
    </>
}