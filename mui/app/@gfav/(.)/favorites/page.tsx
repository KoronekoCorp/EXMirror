import { Fav } from '../Fav'


export default async function Default({ params, searchParams }:
    { params: { any: string[] }, searchParams: { [key: string]: string | undefined } }) {

    if (searchParams.gallery_id && searchParams.gallery_token) {
        return <Fav gallery_id={searchParams.gallery_id} gallery_token={searchParams.gallery_token} />
    }
    return null
}