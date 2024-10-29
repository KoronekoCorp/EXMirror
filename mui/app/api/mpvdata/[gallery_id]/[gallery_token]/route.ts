import { API } from "@/Data/EXAPI"
import { CacheEveryThing } from "@/Data/cache"


export async function GET(
    request: Request,
    props: { params: Promise<{ gallery_id: string, gallery_token: string }> }
) {
    const params = await props.params;

    const {
        gallery_id,
        gallery_token
    } = params;

    const a = new API()

    return Response.json(
        await CacheEveryThing(async () => {
            return a.mpv_info(parseInt(gallery_id), gallery_token)
        }, [`mpv/${gallery_id}/${gallery_token}`], 600)(),
        {
            headers: {
                'Cache-Control': 'max-age=600'
            }
        }
    )
}