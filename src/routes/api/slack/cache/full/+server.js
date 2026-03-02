import sql from "$lib/server/db"

export async function GET() {

  try {

    const data = await sql`
        select * from cache
    `

    return new Response(JSON.stringify(data), { status: 200 })

  } catch (error) {

    return new Response(JSON.stringify({
      error: "something bad happened... api cache db fetch failed with an error, please report this to someone!",
      details: error
    }), { status: 400 })
    
  }

}
