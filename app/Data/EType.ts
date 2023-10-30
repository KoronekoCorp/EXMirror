interface gdataReq {
    "method": "gdata",
    "gidlist": [number, string][],
    "namespace": 1
}
interface torrent {
    "hash": string
    "added": string
    "name": string
    "tsize": string
    "fsize": string
}

interface gmetadata {
    "gid": number,
    "token": string
    "archiver_key": string
    "title": string
    "title_jpn": string
    "category": "Artist CG",
    "thumb": string
    "uploader": string
    "posted": string
    "filecount": string
    "filesize": number
    "expunged": boolean,
    "rating": string
    "torrentcount": string
    "torrents": torrent[],
    "tags": `${string}:${string}`[]
}

export interface gdata {
    "gmetadata": gmetadata[]
}

export interface mpvdata {
    /** 名字 */
    "n": string
    /** API请求key */
    "k": string
    /** 缩略图 */
    "t": string
}

export interface mpvimg {
    "d": "1280 x 1810 :: 322.4 KiB",
    "o": "Download original 2894 x 4093 1.46 MiB source",
    "lf": "fullimg.php?gid=2652532&page=1&key=9q9b3sda42t",
    "ls": "?f_shash=edbdf4d056f612c16790a4f3ffd7ec351bab4ee6&fs_from=c102_001.jpg+from+%5BHoneyRoad+%28Bee+Doushi%29%5D+ALISA+2+Kurenai+no+Mazoku+%5BChinese%5D+%5B%E7%99%BD%E6%9D%A8%E6%B1%89%E5%8C%96%E7%BB%84%5D+%5BDigital%5D",
    "ll": "edbdf4d056f612c16790a4f3ffd7ec351bab4ee6-1526229-2894-4093-jpg/forumtoken/2652532-1/c102_001.jpg",
    "lo": "s/edbdf4d056/2652532-1",
    "xres": "1280",
    "yres": "1810",
    /** 图片地址 */
    "i": string
    "s": "45173"
}