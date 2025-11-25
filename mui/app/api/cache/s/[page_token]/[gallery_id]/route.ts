import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
    return Response.json({ code: 200 }, {
        headers: {
            "Vercel-CDN-Cache-Control": "public, max-age=2592000, immutable",
            "CDN-Cache-Control": "public, max-age=2592000, immutable",
            "Cache-Control": "public, max-age=2592000, immutable",
        }
    })
}

export async function POST(request: Request, props: { params: Promise<{ page_token: string, gallery_id: string }> }) {
    const { page_token, gallery_id } = await props.params;

    try {
        if (gallery_id && page_token) {
            revalidateTag(`s/${page_token}/${gallery_id}?fullimg=false`, { expire: 0 })
            revalidateTag(`s/${page_token}/${gallery_id}?fullimg=true`, { expire: 0 })
            return Response.json({ code: 200 })
        } else {
            return Response.json({ code: 401 })
        }
    } catch {
        return Response.json({ code: 500 })
    }
}