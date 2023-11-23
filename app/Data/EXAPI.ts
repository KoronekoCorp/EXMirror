import { cookies } from "next/headers"
import { gdata, mpvdata, mpvimg } from "./EType"
import { unstable_cache } from "next/cache"
import { writeFile } from "fs"
import { EXJSDOM, ginfo } from "./EXJSDOM"

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
            body: data
        })
        return r.json()
    }

    async no_redirt(url: string) {
        const r = await fetch(url,
            {
                headers: this.header, redirect: 'manual',
            }
        )
        return r.headers.get("location") ?? ""
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
    async gallery_info(gallery_id: number, gallery_token: string, p: number = 1): Promise<[string[], string[], ginfo?]> {
        const url = p === 1 ?
            `https://exhentai.org/g/${gallery_id}/${gallery_token}/` :
            `https://exhentai.org/g/${gallery_id}/${gallery_token}/?p=${p - 1}`
        const r = await this.get(url, [url], 3600 * 24)
        const html = await r.text()
        const dom = EXJSDOM.GetDom(html)
        return p === 1 ? [...EXJSDOM.gallery_imgs(dom), EXJSDOM.gallery_info(dom)] : EXJSDOM.gallery_imgs(dom)
    }

    /**
     * 通过MPV方式获取具体信息
     * @param gallery_id 
     * @param gallery_token 
     * @returns [图片信息, mpvkey, title]
     */
    async mpv_info(gallery_id: number, gallery_token: string): Promise<[mpvdata[], string, string]> {
        const r = await this.get(`https://exhentai.org/mpv/${gallery_id}/${gallery_token}/`, [`https://exhentai.org/mpv/${gallery_id}/${gallery_token}/`], 3600 * 24)
        const html = await r.text()
        return EXJSDOM.MPVdata(html) as [mpvdata[], string, string]
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
        const r = await this.no_redirt("https://exhentai.org/" + d.lf)
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
        return [
            (html.match(/<title>(.*?)<\/title>/) ?? ["", "Unknown Title"])[1],
            (html.match(/<a href="https:\/\/exhentai.org\/g\/(.*?)">/) ?? [])[1],
            (html.match(/<img id=\"img\" src=\"(.*?)"/) ?? [])[1],
            (html.match(/https:\/\/exhentai.org\/fullimg\/(.*?)\">/) ?? [])[1],
            (html.match(/<a id=\"prev\"(.*?)href=\"https:\/\/exhentai.org\/s\/(.*?)\"/) ?? [])[2],
            (html.match(/<a id=\"next\"(.*?)href=\"https:\/\/exhentai.org\/s\/(.*?)\"/) ?? [])[2]
        ]
    }

    /**
     * 解析标准列视图
     * @param searchParams 
     * @param endpoint 
     * @param cache 
     * @returns 
     */
    async http(searchParams: { [key: string]: string }, endpoint = "https://exhentai.org", cache = 3600) {
        const u = new URL(endpoint)
        for (let i in searchParams) {
            u.searchParams.set(i, searchParams[i])
        }
        const r = await this.get(u, [u.href], cache)
        const html = await r.text()
        return EXJSDOM.GetDom(html)
    }

    /**
     * 解析标准列视图
     * @param searchParams 
     * @param endpoint 
     * @param cache 
     * @returns 
     */
    async index(searchParams: { [key: string]: string }, endpoint = "https://exhentai.org", cache = 3600) {
        const dom = await this.http(searchParams, endpoint, cache)
        return EXJSDOM.Index(dom)
    }

    async favourite(searchParams: { [key: string]: string }) {
        const dom = await this.http(searchParams, "https://exhentai.org/favorites.php")
        return {
            index: EXJSDOM.Index(dom),
            fav: EXJSDOM.fav(dom)
        }
    }


    /**
     * 获取用户设置
     * @returns 
     */
    async get_setting() {
        const r = await this.get("https://exhentai.org/uconfig.php", [`uconfig`], 180)
        const html = await r.text()
        return EXJSDOM.setting(html)
    }

    /**
     * 更改用户设置
     * @param data 
     * @returns 
     */
    async change_setting(data: string) {
        const html = await (await fetch("https://exhentai.org/uconfig.php", {
            "headers": {
                ...this.header,
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "Referer": "https://exhentai.org/uconfig.php",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": data,
            "method": "POST"
        })).text()
        return EXJSDOM.setting(html)
    }
}


export { API }


