import { Fav } from '../Fav'


export default async function Default(
    props:
        { searchParams: Promise<{ [key: string]: string | undefined }> }
) {
    const searchParams = await props.searchParams;

    if (searchParams.gallery_id && searchParams.gallery_token) {
        return <Fav gallery_id={searchParams.gallery_id} gallery_token={searchParams.gallery_token} />
    }
    return null
}