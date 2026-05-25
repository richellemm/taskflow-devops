import {
  Bind,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put
} from '@nestjs/common'

import {
  findAllTasks,
  findTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask
} from './tasks.service'

@Controller('tasks')
export class TasksController {
  @Get()
  async findAll() {
    return await findAllTasks()
  }

  @Get(':id')
  @Bind(Param('id'))
  async findOne(id) {
    return await findTaskById(Number(id))
  }

  @Post()
  @Bind(Body())
  async create(body) {
    return await createTask(body)
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  async update(id, body) {
    return await updateTask(Number(id), body)
  }

  @Patch(':id/toggle')
  @Bind(Param('id'))
  async toggle(id) {
    return await toggleTask(Number(id))
  }

  @Delete(':id')
  @Bind(Param('id'))
  async remove(id) {
    return await deleteTask(Number(id))
  }
}