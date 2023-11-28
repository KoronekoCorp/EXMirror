"use client"

import { useState } from "react"

export function Image({ src }: { src: string }) {
    const [error, seterror] = useState(0)
    const [loaded, setloaded] = useState(false)

    // onError有时不触发, BUG.md.2
    const Img = (): JSX.Element => {
        switch (error) {
            case 0:
                return <img
                    id="pic_cover"
                    loading="lazy"
                    className="lazyload blur-up"
                    data-src={"https://aeiljuispo.cloudimg.io/v7/" + src}
                    style={{ width: "100%", minHeight: loaded ? 0 : 800 }}
                    onLoad={() => setloaded(true)}
                    onError={() => seterror(error + 1)}
                />
            default:
                return <img
                    id="pic_cover"
                    loading="lazy"
                    className="lazyload blur-up"
                    data-src={src}
                    style={{ width: "100%", minHeight: loaded ? 0 : 800 }}
                    onLoad={() => setloaded(true)}
                    onError={() => seterror(error + 1)}
                />
        }
    }

    return <>
        <Img />
    </>
}