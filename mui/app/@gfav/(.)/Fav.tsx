import { useAPI } from "@/Data/EXAPI"
import { BackDrop } from "./BackDrop"
import { Favlist } from "./FavClient"

export async function Fav({ params }: { params: { gallery_id: string, gallery_token: string } }) {

    const a = await useAPI()
    const { favs, selectid, favmsg } = await a.fav_get(params.gallery_id, params.gallery_token)

    return <>
        <Favlist fav={selectid != -1 ? `${selectid + 1}` : "undefined"} favs={favs} favmsg={favmsg ?? ""} params={params} />
        <BackDrop />
    </>
}