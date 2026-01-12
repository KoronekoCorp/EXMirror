import { useAPI } from "@/Data/EXAPI";
import { CacheEveryThing } from "@/Data/cache";


export async function GET(
    request: Request,
    props: { params: Promise<{ gallery_id: string, gallery_token: string }> }
) {
    const { gallery_id, gallery_token } = await props.params;

    const a = await useAPI()
    const p = parseInt(new URL(request.url).searchParams.get("p") ?? "")
    const page = isNaN(p) ? 0 : p
    let data = await a.gallery_info(parseInt(gallery_id), gallery_token, page)
    if (data[2]) {
        delete data[2].comments.apikey
        delete data[2].comments.apiuid
    }
    return Response.json(data, {
        headers: {
            'Cache-Control': 'max-age=600'
        }
    })
}