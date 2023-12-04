import { API } from "@/Data/EXAPI"
import { Favlist } from "./client"

export default async function Default({ params: { gallery_id, gallery_token }, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {

    if (searchParams.fav === undefined) return null
    const a = new API()
    const { favs, favmsg } = await a.fav_get(gallery_id, gallery_token)
    return <Favlist fav={searchParams.fav} favs={favs} favmsg={favmsg ?? ""} params={{ gallery_id: gallery_id, gallery_token: gallery_token }} />
}