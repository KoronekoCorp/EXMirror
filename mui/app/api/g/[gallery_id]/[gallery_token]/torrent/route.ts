import { useAPI } from "@/Data/EXAPI";
import { CacheEveryThing } from "@/Data/cache";


export async function GET(
    request: Request,
    props: { params: Promise<{ gallery_id: string, gallery_token: string }> }
) {
    const { gallery_id, gallery_token } = await props.params;

    const a = await useAPI()
    
    return Response.json(await a.torrent(parseInt(gallery_id), gallery_token))
}