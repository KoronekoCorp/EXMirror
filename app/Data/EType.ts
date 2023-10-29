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