import { API } from "@/Data/EXAPI"
import { CacheEveryThing } from "@/Data/cache"
import { cookies } from "next/headers"


export async function GET(request: Request, { params: { gid, page, k, mpvkey } }: { params: { gid: string, page: string, k: string, mpvkey: string } }) {
    const a = new API()
    const fullimg = cookies().get("fullimg")?.value == "true"

    return Response.json(
        await CacheEveryThing(async () => {
            if (fullimg) {
                return a.mpv_full_img(parseInt(gid), parseInt(page), k, mpvkey)
            }
            return a.mpv_get_img(parseInt(gid), parseInt(page), k, mpvkey)
        }, [`api/mpv/${gid}/${page}/${k}?fullimg=${fullimg}`], 3600)(),
        {
            headers: {
                'Cache-Control': 'max-age=3600'
            }
        }
    )
}