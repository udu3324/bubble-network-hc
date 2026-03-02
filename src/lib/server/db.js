import { DATABASE_URL } from '$env/static/private'
import postgres from 'postgres'

const inProduction = process.env.NODE_ENV === 'production'

const globalForSQL = globalThis

const sql =
    globalForSQL.sql ||
    postgres(DATABASE_URL, {
        ssl: inProduction
            ? { rejectUnauthorized: false }
            : false,
        max: 5,
        idle_timeout: 20
    })

export default sql