export async function GET({ url }) {
    const thing = url.searchParams.get("url")

    if (!thing) {
        return new Response(JSON.stringify({
            error: "no id provided"
        }), { status: 400 })
    }

    const res = await fetch(thing)

    if (!res.ok) {
      return new Response('Failed to fetch image', { status: 500 })
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'public, max-age=86400' // cache 1 day
      }
    })
}
