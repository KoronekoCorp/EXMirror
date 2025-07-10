import { API } from "@/Data/EXAPI"
import { CacheEveryThing } from "@/Data/cache"
import { cookies } from "next/headers"


export async function GET(
    request: Request,
    props: { params: Promise<{ gid: string, page: string, k: string, mpvkey: string }> }
) {
    const params = await props.params;

    const {
        gid,
        page,
        k,
        mpvkey
    } = params;

    const a = new API()
    const fullimg = (await cookies()).get("fullimg")?.value == "true"

    return Response.json(
        await CacheEveryThing(async () => {
            if (fullimg) {
                return a.mpv_full_img(parseInt(gid), parseInt(page), k, mpvkey)
            }
            return a.mpv_get_img(parseInt(gid), parseInt(page), k, mpvkey)
        }, [`api/mpv/${page}/${k}?fullimg=${fullimg}`, `mpv-${gid}`], 120)(),
        {
            headers: {
                'Cache-Control': 'max-age=120'
            }
        }
    )
}