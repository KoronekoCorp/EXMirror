import { API } from "@/Data/EXAPI"
import { CacheEveryThing } from "@/Data/cache"
import { cookies } from "next/headers"


export async function GET(
    request: Request,
    props: { params: Promise<{ page_token: string, gallery_id: string }> }
) {
    const params = await props.params;

    const {
        page_token,
        gallery_id
    } = params;

    const a = new API()
    const fullimg = (await cookies()).get("fullimg")?.value == "true"

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
        }, [`s/${page_token}?fullimg=${fullimg}`, `s-${gallery_id}`], 600)(),
        {
            headers: {
                'Cache-Control': 'max-age=600'
            }
        }
    )
}