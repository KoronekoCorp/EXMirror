"use server"

import { API } from "@/Data/EXAPI"

export async function get_setting() {
    const a = new API()
    return { setting: await a.get_setting(), cookies: a.cookies }
}

export async function change_setting(settting: string) {
    const a = new API()
    return { setting: await a.change_setting(settting), cookies: a.cookies }
}