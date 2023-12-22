"use client";
import { useState } from "react";
import { Control } from "./Control";
import { SPVImage } from "./Image";

const preload = 3

export function SPVImages({ spage }: { spage: string[] }) {
    const [state, setstate] = useState<boolean[]>(new Array(spage.length).fill(false))

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
        {spage.map((e, i) => <SPVImage spage={e} page={i + 1} load={state[i]} key={e} />)}
    </Control.Provider>
}