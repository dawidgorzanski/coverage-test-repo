import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { LikesRepository } from './likes.repository.js';
import { LikesService } from './likes.service.js';

describe('LikesService', () => {
  it('refuses to like an unknown post', () => {
    const service = new LikesService(new LikesRepository(), new PostsRepository());

    expect(() => service.create('missing', 'bob')).toThrow(NotFoundException);
  });
});
