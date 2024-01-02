"use client"

import { mpvdata } from "@/Data/EType";
import { useState } from "react";
import { MPVImage } from "./Image";
import { Control } from "./Control";
4
const preload = 3

export function MPVImages({ gid, mpvdata, mpvkey, time }: { gid: number, mpvdata: mpvdata[], mpvkey: string, time?: number }) {
    const [state, setstate] = useState<boolean[]>(new Array(mpvdata.length).fill(false))
    const changeload = (i: number) => {
        const s = state.slice()
        for (let j = i - preload; j < i + preload; j++) {
            if (j >= 0 && j < s.length) {
                s[j] = true
            }
        }
        setstate(s)
    }

    return <Control.Provider value={changeload} >
        {mpvdata.map((e, i) => <MPVImage key={e.n} gid={gid} page={i + 1} mpvdata={e} mpvkey={mpvkey} load={state[i]} time={time} />)}
    </Control.Provider>
}