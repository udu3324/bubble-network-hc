export async function GET({ url }) {
    const thing = url.searchParams.get("url")

    if (!thing) {
      return new Response(JSON.stringify({
          error: "no url provided"
      }), { status: 400 })
    }

    let parsed
    try {
      parsed = new URL(thing)
    } catch {
      return new Response(JSON.stringify({
          error: "invalid url"
      }), { status: 400 })
    }

    if (!(/^https:\/\/avatars\.slack-edge\.com\//.test(parsed.href) || /^https:\/\/secure\.gravatar\.com\//.test(parsed.href))) {
        return new Response(JSON.stringify({
            error: "unauthorized url"
        }), { status: 400 })
    }

    const res = await fetch(parsed.href)

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
