import { GdataTr } from "@/Data/ETools";
import { useAPI } from "@/Data/EXAPI";
import { db } from "@/Data/EXDB";


export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;

    const __tr = db.getDB()
    const a = await useAPI()
    let data = await a.favourite(Object.fromEntries(searchParams))
    const tr = await __tr
    data.index[0] = GdataTr(data.index[0], tr)

    return Response.json(data, {
        headers: {
            'Cache-Control': 'private, max-age=600'
        }
    })
}