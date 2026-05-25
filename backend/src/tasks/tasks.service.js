import { HttpException, HttpStatus } from '@nestjs/common'
import { pool } from '../database'

function validateTaskPayload(payload) {
  if (!payload?.title?.trim()) {
    throw new HttpException('O título é obrigatório', HttpStatus.BAD_REQUEST)
  }
}

export async function findAllTasks() {
  const result = await pool.query(`
    SELECT id, title, description, completed, created_at
    FROM tasks
    ORDER BY id DESC
  `)

  return result.rows
}

export async function findTaskById(id) {
  const result = await pool.query(
    `
    SELECT id, title, description, completed, created_at
    FROM tasks
    WHERE id = $1
    `,
    [id]
  )

  if (result.rows.length === 0) {
    throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND)
  }

  return result.rows[0]
}

export async function createTask(payload) {
  validateTaskPayload(payload)

  const result = await pool.query(
    `
    INSERT INTO tasks (title, description, completed)
    VALUES ($1, $2, $3)
    RETURNING id, title, description, completed, created_at
    `,
    [
      payload.title.trim(),
      payload.description ? payload.description.trim() : null,
      payload.completed === true
    ]
  )

  return result.rows[0]
}

export async function updateTask(id, payload) {
  validateTaskPayload(payload)

  const exists = await pool.query(`SELECT id FROM tasks WHERE id = $1`, [id])

  if (exists.rows.length === 0) {
    throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND)
  }

  const result = await pool.query(
    `
    UPDATE tasks
    SET title = $1,
        description = $2,
        completed = $3
    WHERE id = $4
    RETURNING id, title, description, completed, created_at
    `,
    [
      payload.title.trim(),
      payload.description ? payload.description.trim() : null,
      payload.completed === true,
      id
    ]
  )

  return result.rows[0]
}

export async function toggleTask(id) {
  const result = await pool.query(
    `
    UPDATE tasks
    SET completed = NOT completed
    WHERE id = $1
    RETURNING id, title, description, completed, created_at
    `,
    [id]
  )

  if (result.rows.length === 0) {
    throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND)
  }

  return result.rows[0]
}

export async function deleteTask(id) {
  const result = await pool.query(
    `
    DELETE FROM tasks
    WHERE id = $1
    RETURNING id
    `,
    [id]
  )

  if (result.rows.length === 0) {
    throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND)
  }

  return {
    message: 'Tarefa removida com sucesso'
  }
}