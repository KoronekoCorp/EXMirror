import { db } from "@/Data/EXDB";

export async function GET(request: Request, { params: { search } }: { params: { search: string } }) {

    const d = await db.getDB()
    const fin: {
        key: string
        name: string,
        intro: string,
        links: string,
    }[] = []
    for (const i in d) {
        for (const j in d[i].data) {
            const o = d[i].data[j]
            if (o.name.includes(search) || `${i}:${j}`.includes(search)) fin.push({ key: `${i}:${j}`, ...d[i].data[j] })
        }
    }
    return Response.json(fin.slice(0, 20), {
        headers: {
            'Cache-Control': 'max-age=3600'
        }
    })
}