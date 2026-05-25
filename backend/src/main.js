import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initDatabase } from './database'

async function bootstrap() {
  await initDatabase()

  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })

  const port = process.env.PORT || 8080
  await app.listen(port, '0.0.0.0')

  console.log(`Backend rodando na porta ${port}`)
}

bootstrap()