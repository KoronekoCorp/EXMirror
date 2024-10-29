import { Fav } from '../../../Fav'


export default async function Default(
    props:
        { params: Promise<{ gallery_id: string, gallery_token: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    if (searchParams.fav) {
        return <Fav gallery_id={params.gallery_id} gallery_token={params.gallery_token} />
    }
    return null
}