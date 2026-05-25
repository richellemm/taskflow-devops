import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
})

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function initDatabase() {
  const maxRetries = 10
  const delay = 3000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)

      console.log('Banco conectado com sucesso.')
      return
    } catch (error) {
      console.log(`Tentativa ${attempt} de ${maxRetries} para conectar ao banco...`)

      if (attempt === maxRetries) {
        throw error
      }

      await wait(delay)
    }
  }
}