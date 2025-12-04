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
    return Response.json(
        await a.gallery_info(parseInt(gallery_id), gallery_token, page),
        {
            headers: {
                'Cache-Control': 'max-age=600'
            }
        }
    )
}