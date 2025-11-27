import { Fav } from '../../../Fav'
import { Torrent } from '../../../Torrent';


export default async function Default(
    props:
        { params: Promise<{ gallery_id: string, gallery_token: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    if (searchParams.fav) {
        return <Fav params={params} />
    } else if (searchParams.torrent) {
        return <Torrent params={params} />
    }
    return null
}