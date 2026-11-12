import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { BlogModule } from './../src/blog.module.js';

describe('Blog (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BlogModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('refuses to delete an author who has posts', async () => {
    const http = app.getHttpServer();
    const author = (await request(http).post('/authors').send({ name: 'Ada' })).body;
    await request(http)
      .post('/posts')
      .send({ authorId: author.id, title: 'T', content: 'C' })
      .expect(201);

    await request(http).delete(`/authors/${author.id}`).expect(409);
  });

  afterEach(async () => {
    await app.close();
  });
});
