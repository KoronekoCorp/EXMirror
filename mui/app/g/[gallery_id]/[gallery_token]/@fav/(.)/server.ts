"use server"

import { API } from "@/Data/EXAPI"

export async function add(gallery_id: string, gallery_token: string, favcat: string, favnote: string) {
    const a = new API()
    return await a.fav_post(gallery_id, gallery_token, favcat, favnote)
}