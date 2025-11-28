import { Fav } from '../Fav';
import { Torrent } from '../Torrent';


export default async function Default(
    props: { searchParams: Promise<{ [key: string]: string | undefined }> }
) {
    const searchParams = await props.searchParams;

    if (searchParams.gallery_id && searchParams.gallery_token) {
        if (searchParams.type == "fav") {
            return <Fav params={searchParams as any} />
        } else if (searchParams.type == "torrent") {
            return <Torrent params={searchParams as any} />
        }
    }
    return null
}