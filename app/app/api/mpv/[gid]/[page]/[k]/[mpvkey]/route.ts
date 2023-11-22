import { API } from "@/Data/EXAPI"
import { cookies } from "next/headers"


export async function GET(request: Request, { params: { gid, page, k, mpvkey } }: { params: { gid: string, page: string, k: string, mpvkey: string } }) {
    const a = new API()
    const fullimg = cookies().get("fullimg")?.value == "true"

    if (fullimg) {
        return Response.json(await a.mpv_full_img(parseInt(gid), parseInt(page), k, mpvkey))
    }
    return Response.json(await a.mpv_get_img(parseInt(gid), parseInt(page), k, mpvkey))
}