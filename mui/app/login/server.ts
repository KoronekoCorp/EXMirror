"use server"

import { useAPI } from "@/Data/EXAPI"

export async function get_setting() {
    const a = await useAPI()
    return { setting: await a.get_setting(), cookies: a.cookies }
}

export async function change_setting(settting: string) {
    const a = await useAPI()
    return { setting: await a.change_setting(settting), cookies: a.cookies }
}