import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

import App from '../App'
import api from '../services/api'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    window.alert = vi.fn()
    window.confirm = vi.fn()

    vi.mocked(api.get).mockResolvedValue({
      data: [],
    })
  })

  it('renderiza a tela inicial de tarefas', async () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /TaskFlow/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText(/título da tarefa/i),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByText(/nenhuma tarefa cadastrada/i),
      ).toBeInTheDocument()
    })
  })

  it('renderiza tarefas vindas da api', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Estudar React',
          description: 'Hooks',
          completed: false,
        },
      ],
    })

    render(<App />)

    expect(
      await screen.findByText(/estudar react/i),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/hooks/i),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/pendente/i),
    ).toBeInTheDocument()
  })

  it('cria uma nova tarefa', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({})
    vi.mocked(api.get).mockResolvedValue({
      data: [],
    })

    render(<App />)

    await userEvent.type(
      screen.getByPlaceholderText(/título da tarefa/i),
      'Nova tarefa',
    )

    await userEvent.type(
      screen.getByPlaceholderText(/descrição/i),
      'Descrição teste',
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: /criar tarefa/i,
      }),
    )

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/tasks', {
        title: 'Nova tarefa',
        description: 'Descrição teste',
        completed: false,
      })
    })
  })

  it('não cria tarefa sem título', async () => {
    render(<App />)

    await userEvent.click(
      screen.getByRole('button', {
        name: /criar tarefa/i,
      }),
    )

    expect(window.alert).toHaveBeenCalledWith(
      'Informe o título da tarefa',
    )

    expect(api.post).not.toHaveBeenCalled()
  })

  it('conclui uma tarefa', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Task',
          description: '',
          completed: false,
        },
      ],
    })

    vi.mocked(api.patch).mockResolvedValueOnce({})

    render(<App />)

    const button = await screen.findByRole('button', {
      name: /concluir/i,
    })

    await userEvent.click(button)

    expect(api.patch).toHaveBeenCalledWith(
      '/tasks/1/toggle',
    )
  })

  it('remove uma tarefa', async () => {
    window.confirm = vi.fn(() => true)

    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Task',
          description: '',
          completed: false,
        },
      ],
    })

    vi.mocked(api.delete).mockResolvedValueOnce({})

    render(<App />)

    const button = await screen.findByRole('button', {
      name: /excluir/i,
    })

    await userEvent.click(button)

    expect(api.delete).toHaveBeenCalledWith(
      '/tasks/1',
    )
  })

  it('entra em modo edição ao clicar em editar', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Task teste',
          description: 'Descrição teste',
          completed: false,
        },
      ],
    })

    render(<App />)

    const editButton = await screen.findByRole('button', {
      name: /editar/i,
    })

    await userEvent.click(editButton)

    expect(
      screen.getByDisplayValue('Task teste'),
    ).toBeInTheDocument()

    expect(
      screen.getByDisplayValue('Descrição teste'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /atualizar tarefa/i,
      }),
    ).toBeInTheDocument()
  })

  it('atualiza uma tarefa', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: 'Task antiga',
          description: 'Descrição antiga',
          completed: false,
        },
      ],
    })

    vi.mocked(api.put).mockResolvedValueOnce({})

    render(<App />)

    const editButton = await screen.findByRole('button', {
      name: /editar/i,
    })

    await userEvent.click(editButton)

    const titleInput = screen.getByPlaceholderText(
      /título da tarefa/i,
    )

    await userEvent.clear(titleInput)

    await userEvent.type(titleInput, 'Task atualizada')

    await userEvent.click(
      screen.getByRole('button', {
        name: /atualizar tarefa/i,
      }),
    )

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/tasks/1', {
        title: 'Task atualizada',
        description: 'Descrição antiga',
        completed: false,
      })
    })
  })

  it('exibe loading ao carregar tarefas', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}),
    )

    render(<App />)

    expect(
      screen.getByText(/carregando/i),
    ).toBeInTheDocument()
  })

  it('exibe alerta ao falhar carregamento', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(
      new Error('Erro API'),
    )

    render(<App />)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Erro ao carregar tarefas',
      )
    })
  })
})