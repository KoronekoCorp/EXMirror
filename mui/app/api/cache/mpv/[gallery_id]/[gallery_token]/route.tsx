import { revalidateTag } from "next/cache"

export async function GET(request: Request) {
    return Response.json({ code: 200 }, {
        headers: {
            "Vercel-CDN-Cache-Control": "public, max-age=2592000, immutable",
            "CDN-Cache-Control": "public, max-age=2592000, immutable",
            "Cache-Control": "public, max-age=2592000, immutable",
        }
    })
}

export async function POST(request: Request, props: { params: Promise<{ gallery_id: string, gallery_token: string }> }) {
    const params = await props.params;

    const {
        gallery_token, gallery_id
    } = params;

    try {
        if (gallery_id && gallery_token) {
            revalidateTag(`mpv/${gallery_id}/${gallery_token}`)
            revalidateTag(`mpv-${gallery_id}`)
            return Response.json({ code: 200 })
        } else {
            return Response.json({ code: 401 })
        }
    } catch {
        return Response.json({ code: 500 })
    }
}