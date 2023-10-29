import { cookies } from "next/headers"
import { gdata } from "./EType"
import { writeFile } from "fs"

class API {
    BASE = "https://s.exhentai.org/api.php"
    header = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "cookie": ""
    }
    constructor(cookie: string = cookies().toString()) {
        this.header.cookie = cookie
    }

    async get(url: URL | string, tags: string[] | undefined, revalidate: number | false | undefined = 7200, cache: RequestCache | undefined = undefined) {
        return fetch(url, {
            headers: this.header,
            next: {
                revalidate: revalidate,
                tags: tags
            },
            cache: cache
        })
    }

    async post(data: string, tags: string[] | undefined, revalidate: number | false | undefined = 7200, useCookie: boolean = false, cache: RequestCache | undefined = undefined) {
        const r = await fetch(this.BASE, {
            method: "POST",
            headers: {
                ...this.header,
                "cookie": useCookie ? this.header.cookie : "",
                "Content-Type": "application/json",
                "Content-Length": data.length.toString(),
                "Accept-Encoding": "gzip",
            },
            body: data,
            next: {
                revalidate: revalidate,
                tags: tags
            },
            cache: cache
        })
        return await r.json()
    }

    /**
     * 画廊总览数据
     * @param glist 
     * @returns 
     */
    async gdata(glist: [number, string][]) {
        const d = {
            "method": "gdata",
            "gidlist": glist,
            "namespace": 1
        }
        return this.post(JSON.stringify(d), [`${glist.map((e) => e[0] + e[1])}`], 3600 * 24, false) as Promise<gdata>
    }


    async gallery_info(gallery_id: number, gallery_token: string) {
        const r = await this.get(`https://exhentai.org/g/${gallery_id}/${gallery_token}/`, [`https://exhentai.org/g/${gallery_id}/${gallery_token}/`], 3600 * 24)
        const html = await r.text()
        return [
            Array.from(html.matchAll(/src=\"https:\/\/s.exhentai.org\/t\/(.*?).(.*?)\"/g)),
            Array.from(html.matchAll(/<a href="https:\/\/exhentai.org\/s\/(.*?)">/g))
        ]
    }
}


export { API }


