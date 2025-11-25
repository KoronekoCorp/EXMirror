import { useAPI } from "@/Data/EXAPI";
import { CacheEveryThing } from "@/Data/cache";


export async function GET(
    request: Request,
    props: { params: Promise<{ gallery_id: string, gallery_token: string }> }
) {
    const { gallery_id, gallery_token } = await props.params;

    const a = await useAPI()

    return Response.json(
        await CacheEveryThing(async () => {
            return a.gdata([[parseInt(gallery_id), gallery_token]])
        }, [`api/gdata/${gallery_id}/${gallery_token}`], 600)(),
        {
            headers: {
                'Cache-Control': 'max-age=600'
            }
        }
    )
}