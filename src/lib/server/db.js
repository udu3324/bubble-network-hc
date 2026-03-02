import { DATABASE_URL } from '$env/static/private'
import postgres from 'postgres'

const globalForSQL = globalThis

const sql =
    globalForSQL.sql ||
    postgres(DATABASE_URL, {
        ssl: process.env.NODE_ENV === 'production',
        max: 5,
        idle_timeout: 20
    })

export default sql