"use server"

import { API } from "@/Data/EXAPI"
import { cookies } from "next/headers"

export async function get_image(gid: number, page: number, imgkey: string, mpvkey: string) {
    const a = new API()
    const fullimg = cookies().get("fullimg")?.value == "true"

    if (fullimg) {
        return a.mpv_full_img(gid, page, imgkey, mpvkey)
    }
    return a.mpv_get_img(gid, page, imgkey, mpvkey)
}