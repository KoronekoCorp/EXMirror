import { useAPI } from "@/Data/EXAPI"
import { BackDrop } from "./BackDrop"
import { Favlist } from "./FavClient"

export async function Fav({ gallery_id, gallery_token }:
    { gallery_id: string, gallery_token: string }) {

    const a = await useAPI()
    const torrent = await a.torrent(gallery_id, gallery_token)

    return <>
        <BackDrop />
    </>
}