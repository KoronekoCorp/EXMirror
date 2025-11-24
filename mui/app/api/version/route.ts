import version from "./version.json"

export async function GET() {
    try {
        return Response.json({ "buildid": version.buildid })
    } catch { }

    return Response.json({ "buildid": process.env.BUILD_ID ?? `Date-${(Date.now() / 1000 | 0) / 3600 / 24 | 0}` })
}