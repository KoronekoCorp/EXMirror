import { cookies } from "next/headers"
import { gdata, mpvdata, mpvimg } from "./EType"
import { unstable_cache } from "next/cache"
import { writeFile } from "fs"
import { Index } from "./EXJSDOM"

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
    cookies: string[] = []
    constructor(cookie: string = cookies().toString()) {
        this.header.cookie = cookie
    }

    async get(url: URL | string, tags: string[] | undefined, revalidate: number | false | undefined = 7200) {
        // return fetch(url, {
        //     headers: this.header,
        //     next: {
        //         revalidate: revalidate,
        //         tags: tags
        //     },
        //     cache: cache
        // })
        const r = await fetch(url, {
            headers: this.header,
            next: {
                revalidate: revalidate,
                tags: tags
            }
        })
        console.log(r.headers.getSetCookie())
        r.headers.getSetCookie().forEach((e) => this.cookies.push(e))
        return r
    }

    async post(data: string, tags: string[] | undefined, revalidate: number | false | undefined = 7200, useCookie: boolean = false) {
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
        })
        return await r.json()
    }

    async no_redirt(url: string, tags: string[] | undefined, revalidate: number | false | undefined = 7200) {
        return unstable_cache(async () => {
            const r = await fetch(url,
                {
                    headers: this.header, redirect: 'manual',
                    next: { revalidate: revalidate, tags: tags }
                }
            )
            return r.headers.get("location") ?? ""
        }, tags, { revalidate: revalidate, tags: tags })()
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


    /**
     * 画廊详细数据
     * @param gallery_id 
     * @param gallery_token 
     * @param p 
     * @returns 
     */
    async gallery_info(gallery_id: number, gallery_token: string, p: number = 1): Promise<[RegExpMatchArray[], RegExpMatchArray[]]> {
        const url = p === 1 ?
            `https://exhentai.org/g/${gallery_id}/${gallery_token}/` :
            `https://exhentai.org/g/${gallery_id}/${gallery_token}/?p=${p - 1}`
        const r = await this.get(url, [url], 3600 * 24)
        const html = await r.text()
        return [
            Array.from(html.matchAll(/src=\"https:\/\/s.exhentai.org\/t\/(.*?).(.*?)\"/g)),
            Array.from(html.matchAll(/<a href="https:\/\/exhentai.org\/s\/(.*?)">/g))
        ]
    }

    /**
     * 通过MPV方式获取具体信息
     * @param gallery_id 
     * @param gallery_token 
     * @returns [图片信息, mpvkey]
     */
    async mpv_info(gallery_id: number, gallery_token: string): Promise<[mpvdata[], string]> {
        const r = await this.get(`https://exhentai.org/mpv/${gallery_id}/${gallery_token}/`, [`https://exhentai.org/mpv/${gallery_id}/${gallery_token}/`], 3600 * 24)
        const html = await r.text()

        return [
            JSON.parse(Array.from(html.matchAll(/var imagelist =(.*?);/g))[0][1]) as mpvdata[],//图片信息
            Array.from(html.matchAll(/var mpvkey = "(.*?)"/g))[0][1]//请求顶级key
        ]
    }

    /**
     * MPV获取图像
     * @param gid 
     * @param page 
     * @param imgkey 
     * @param mpvkey 
     * @returns 
     */
    async mpv_get_img(gid: number, page: number, imgkey: string, mpvkey: string) {
        const d = {
            "method": "imagedispatch",
            "gid": gid,
            "page": page,
            "imgkey": imgkey,
            "mpvkey": mpvkey
        }
        return this.post(JSON.stringify(d), [`imagedispatch_${gid}_${page}_${imgkey}`], 3600 * 24, true) as Promise<mpvimg>
    }

    /**
     * 获取源图像
     * @param gid 
     * @param page 
     * @param imgkey 
     * @param mpvkey 
     * @returns 
     */
    async mpv_full_img(gid: number, page: number, imgkey: string, mpvkey: string) {
        const d = await this.mpv_get_img(gid, page, imgkey, mpvkey)
        const r = await this.no_redirt("https://exhentai.org/" + d.lf, [`mpv_full_img_${gid}_${page}_${imgkey}`], 3600 * 24)
        return { ...d, "i": r == "" ? d.i : r }
    }

    /**
     * 常规单页信息
     * @param page_token 
     * @param gallery_id 
     * @returns [标题, 画廊根页, 图片url, 源图片获取url, 上一页, 下一页]
     */
    async s_info(page_token: string, gallery_id: string) {
        const r = await this.get(`https://exhentai.org/s/${page_token}/${gallery_id}`, [`s_${page_token}/${gallery_id}`], 3600 * 24)
        const html = await r.text()
        writeFile("./0.html", html, 'utf-8', () => { })
        return [
            (html.match(/<title>(.*?)<\/title>/) ?? ["", "Unknown Title"])[1],
            (html.match(/<a href="https:\/\/exhentai.org\/g\/(.*?)">/) ?? [])[1],
            (html.match(/<img id=\"img\" src=\"(.*?)"/) ?? [])[1],
            (html.match(/https:\/\/exhentai.org\/fullimg\/(.*?)\">/) ?? [])[1],
            (html.match(/<a id=\"prev\"(.*?)href=\"https:\/\/exhentai.org\/s\/(.*?)\"/) ?? [])[2],
            (html.match(/<a id=\"next\"(.*?)href=\"https:\/\/exhentai.org\/s\/(.*?)\"/) ?? [])[2]
        ]
    }

    async index(searchParams: { [key: string]: string }, endpoint = "https://exhentai.org", cache = 3600) {
        const u = new URL(endpoint)
        for (let i in searchParams) {
            u.searchParams.set(i, searchParams[i])
        }
        const r = await this.get(u, [u.href], cache)
        const html = await r.text()
        // writeFile("./0.html", html, 'utf-8', () => { })
        return Index(html)
    }
}


export { API }


