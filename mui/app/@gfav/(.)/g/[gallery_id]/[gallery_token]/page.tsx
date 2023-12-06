import { Fav } from '../../../Fav'


export default async function Default({ params, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {

    if (searchParams.fav) {
        return <Fav gallery_id={params.gallery_id} gallery_token={params.gallery_token} />
    }
    return null
}