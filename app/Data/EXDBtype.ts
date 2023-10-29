interface single {
    "name": `<p>${string}</p>`,
    "intro": `<p>${string}</p>`,
    "links": `<p>${string}</p>`,
}

interface data {
    "namespace": string
    "frontMatters": {
        "name": string
        "description": string
        "key": string
        "rules": string[]
    },
    "count": number
    "data": {
        [key: string]: single
    }
}

export interface DBTR {
    data: data[]
    head: {
        "sha": string
        "message": string
        "author": {
            "name": string
            "email": string
            "when": string
        },
        "committer": {
            "name": string
            "email": string
            "when": string
        }
    }
    repo: "https://github.com/EhTagTranslation/Database"
    version: 6
}

export interface DBindex {
    [key: string]: data
}


export interface version {
    "url": string
    "assets_url": string
    "upload_url": string
    "html_url": string
    "id": number,
    "author": any,
    "node_id": string
    "tag_name": string
    "target_commitish": string
    "name": string
    "draft": false,
    "prerelease": false,
    "created_at": string
    "published_at": string
    "assets": [],
    "tarball_url": string
    "zipball_url": string
    "body": string
}