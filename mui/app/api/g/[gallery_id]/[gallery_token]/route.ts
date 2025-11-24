import { useAPI } from "@/Data/EXAPI";
import { CacheEveryThing } from "@/Data/cache";


export async function GET(
    request: Request,
    props: { params: Promise<{ gallery_id: string, gallery_token: string }> }
) {
    const params = await props.params;

    const {
        gallery_id,
        gallery_token
    } = params;

    const a = await useAPI()
    const p = parseInt(new URL(request.url).searchParams.get("p") ?? "")
    const page = isNaN(p) ? 0 : p
    return Response.json(
        await CacheEveryThing(async () => {
            return a.gallery_info(parseInt(gallery_id), gallery_token, page)
        }, [`g/${gallery_id}/${gallery_token}`, `${page}`], 600)(),
        {
            headers: {
                'Cache-Control': 'max-age=600'
            }
        }
    )
}