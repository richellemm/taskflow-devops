import {
    findAllTasks,
    findTaskById,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
} from '../src/tasks/tasks.service'

import { TasksController } from '../src/tasks/tasks.controller'

jest.mock('../src/tasks/tasks.service', () => ({
    findAllTasks: jest.fn(),
    findTaskById: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn()
}))

describe('Tasks Controller', () => {
    let controller

    beforeEach(() => {
        controller = new TasksController()
        jest.clearAllMocks()
    })

    it('deve listar todas as tarefas', async () => {
        const tasks = [{ id: 1, title: 'Task 1' }]
        findAllTasks.mockResolvedValue(tasks)

        await expect(controller.findAll()).resolves.toEqual(tasks)
        expect(findAllTasks).toHaveBeenCalledTimes(1)
    })

    it('deve buscar uma tarefa por id numerico', async () => {
        const task = { id: 1, title: 'Task 1' }
        findTaskById.mockResolvedValue(task)

        await expect(controller.findOne('1')).resolves.toEqual(task)
        expect(findTaskById).toHaveBeenCalledWith(1)
    })

    it('deve criar uma tarefa', async () => {
        const payload = { title: 'Nova tarefa' }
        const createdTask = { id: 1, ...payload, completed: false }
        createTask.mockResolvedValue(createdTask)

        await expect(controller.create(payload)).resolves.toEqual(createdTask)
        expect(createTask).toHaveBeenCalledWith(payload)
    })
    
    it('deve atualizar uma tarefa', async () => {
        const payload = { title: 'Task atualizada' }
        const updatedTask = { id: 1, ...payload, completed: false }
        updateTask.mockResolvedValue(updatedTask)

        await expect(controller.update('1', payload)).resolves.toEqual(updatedTask)
        expect(updateTask).toHaveBeenCalledWith(1, payload)
    })

    it('deve alternar o status de uma tarefa', async () => {
        const toggledTask = { id: 1, title: 'Task 1', completed: true }
        toggleTask.mockResolvedValue(toggledTask)

        await expect(controller.toggle('1')).resolves.toEqual(toggledTask)
        expect(toggleTask).toHaveBeenCalledWith(1)
    })

    it('deve remover uma tarefa', async () => {
        const deletedTask = { id: 1, title: 'Task 1' }
        deleteTask.mockResolvedValue(deletedTask)

        await expect(controller.remove('1')).resolves.toEqual(deletedTask)
        expect(deleteTask).toHaveBeenCalledWith(1)
    })
})
