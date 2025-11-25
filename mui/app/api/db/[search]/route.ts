import { db } from "@/Data/EXDB";

const Score: {
    [k: string]: number;
} = {
    other: 10,
    female: 9,
    male: 8.5,
    mixed: 8,
    language: 2,
    artist: 2.5,
    cosplayer: 2.4,
    group: 2.2,
    parody: 3.3,
    character: 2.8,
    reclass: 1,
    rows: 0,
    temp: 0.1,
}

export async function GET(request: Request, props: { params: Promise<{ search: string }> }) {
    const { search } = await props.params;

    const d = await db.getDB()
    const fin: {
        key: string
        name: string,
        intro?: string,
        links?: string,
        score: number
    }[] = [{ key: search, name: search, score: 10 }]
    for (const i in d) {
        for (const j in d[i].data) {
            const o = d[i].data[j]
            if (`${i}:${j}`.includes(search)) {
                fin.push({
                    score: Score[d[i].frontMatters.key],
                    key: `${i}:${j}`,
                    ...o,
                    name: d[i].frontMatters.name + " " + o.name.replace("https://", "https://acodsaidap.cloudimg.io/v7/https://").replace("<p>", "").replace("</p>", ""),
                })
            } else if (o.name.includes(search)) {
                fin.push({
                    score: Score[d[i].frontMatters.key] * 0.9,
                    key: `${i}:${j}`,
                    ...o,
                    name: d[i].frontMatters.name + " " + o.name.replace("https://", "https://acodsaidap.cloudimg.io/v7/https://").replace("<p>", "").replace("</p>", ""),
                })
            } else if (o.intro.includes(search)) {
                fin.push({
                    score: Score[d[i].frontMatters.key] * 0.5,
                    key: `${i}:${j}`,
                    ...o,
                    name: d[i].frontMatters.name + " " + o.name.replace("https://", "https://acodsaidap.cloudimg.io/v7/https://").replace("<p>", "").replace("</p>", ""),
                })
            }
        }
    }
    fin.sort((i, j) => j.score - i.score)

    return Response.json(fin.slice(0, 50), {
        headers: {
            'Cache-Control': 'max-age=604800'
        }
    })
}