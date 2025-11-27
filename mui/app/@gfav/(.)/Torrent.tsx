import { useAPI } from "@/Data/EXAPI"
import { BackDrop } from "./BackDrop"
import { TorrentClient } from "./TorrentClient"

export async function Torrent({ params }: { params: { gallery_id: string, gallery_token: string } }) {

    const a = await useAPI()
    const torrent = await a.torrent(params.gallery_id, params.gallery_token)

    return <>
        <TorrentClient torrent={torrent} params={params} />
        <BackDrop />
    </>
}