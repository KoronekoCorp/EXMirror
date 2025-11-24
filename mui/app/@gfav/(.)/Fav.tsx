import { useAPI } from "@/Data/EXAPI"
import { BackDrop } from "./BackDrop"
import { Favlist } from "./client"

export async function Fav({ gallery_id, gallery_token }:
    { gallery_id: string, gallery_token: string }) {

    const a = await useAPI()
    const { favs, selectid, favmsg } = await a.fav_get(gallery_id, gallery_token)

    return <>
        <Favlist fav={selectid != -1 ? `${selectid + 1}` : "undefined"} favs={favs} favmsg={favmsg ?? ""} params={{ gallery_id: gallery_id, gallery_token: gallery_token }} />
        <BackDrop />
    </>
}