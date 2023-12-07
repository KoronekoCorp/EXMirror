import { API } from "@/Data/EXAPI"
import { CacheEveryThing } from "@/Data/cache"
import { cookies } from "next/headers"


export async function GET(request: Request, { params: { page_token, gallery_id } }: { params: { page_token: string, gallery_id: string } }) {
    const a = new API()
    const fullimg = cookies().get("fullimg")?.value == "true"

    return Response.json(
        await CacheEveryThing(async () => {
            const data = await a.s_info(page_token, gallery_id)
            let url: string
            if (fullimg && data.fullimg) {
                url = await a.no_redirt(data.fullimg)
            } else {
                url = data.img
            }
            return { data, url }
        }, [`s/${page_token}/${gallery_id}?fullimg=${fullimg}`], 3600)(),
        {
            headers: {
                'Cache-Control': 'max-age=3600'
            }
        }
    )
}