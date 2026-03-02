import { DATABASE_URL } from '$env/static/private'
import postgres from 'postgres'

const sql = postgres(DATABASE_URL, {
    ssl: process.env.NODE_ENV === 'production'
})

export default sql