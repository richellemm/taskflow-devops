import { useEffect, useState } from 'react'
import api from './services/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadTasks() {
    try {
      setLoading(true)
      const response = await api.get('/tasks')
      setTasks(response.data)
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar tarefas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      alert('Informe o título da tarefa')
      return
    }

    try {
      if (editingId) {
        const currentTask = tasks.find((task) => task.id === editingId)

        await api.put(`/tasks/${editingId}`, {
          title,
          description,
          completed: currentTask?.completed || false
        })
      } else {
        await api.post('/tasks', {
          title,
          description,
          completed: false
        })
      }

      resetForm()
      loadTasks()
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar tarefa')
    }
  }

  function handleEdit(task) {
    setEditingId(task.id)
    setTitle(task.title)
    setDescription(task.description || '')
  }

  async function handleToggle(id) {
    try {
      await api.patch(`/tasks/${id}/toggle`)
      loadTasks()
    } catch (error) {
      console.error(error)
      alert('Erro ao alterar status')
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Deseja excluir esta tarefa?')
    if (!confirmed) return

    try {
      await api.delete(`/tasks/${id}`)
      loadTasks()
    } catch (error) {
      console.error(error)
      alert('Erro ao excluir tarefa')
    }
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setDescription('')
  }

  return (
    <div className="container">
      <div className="card">
        <h1>TaskFlow</h1>
        <p className="subtitle">Gerencie suas tarefas de forma simples, rápida e eficiente</p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título da tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="actions">
            <button type="submit">
              {editingId ? 'Atualizar tarefa' : 'Criar tarefa'}
            </button>

            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Minhas tarefas</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : tasks.length === 0 ? (
          <p>Nenhuma tarefa cadastrada.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'done' : ''}`}
              >
                <div className="task-content">
                  <h3>{task.title}</h3>
                  <p>{task.description || 'Sem descrição'}</p>
                  <span>{task.completed ? 'Concluída' : 'Pendente'}</span>
                </div>

                <div className="task-buttons">
                  <button onClick={() => handleToggle(task.id)}>
                    {task.completed ? 'Reabrir' : 'Concluir'}
                  </button>

                  <button
                    className="secondary"
                    onClick={() => handleEdit(task)}
                  >
                    Editar
                  </button>

                  <button
                    className="danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App