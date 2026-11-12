import { NestFactory } from '@nestjs/core';
import { BlogModule } from './blog.module.js';

async function bootstrap() {
  const app = await NestFactory.create(BlogModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
