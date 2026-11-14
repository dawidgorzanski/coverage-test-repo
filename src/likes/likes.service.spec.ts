import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { LikesRepository } from './likes.repository.js';
import { LikesService } from './likes.service.js';

describe('LikesService', () => {
  it('refuses to like an unknown post', () => {
    const service = new LikesService(
      new LikesRepository(),
      new PostsRepository(),
    );

    expect(() => service.create('missing', 'bob')).toThrow(NotFoundException);
  });
});

describe('LikesService operations', () => {
  let service: LikesService;
  let likes: LikesRepository;

  beforeEach(() => {
    likes = new LikesRepository();
    const posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    posts.save({ id: 'p2', authorId: 'a1', title: 'Other', content: 'Body' });
    service = new LikesService(likes, posts);
  });

  it('creates and persists a like for an existing post', () => {
    const like = service.create('p1', 'bob');

    expect(like).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
    });
    expect(like.id).not.toBe('');
    expect(likes.findById(like.id)).toEqual(like);
    expect(service.findOne(like.id)).toEqual(like);
  });

  it('rejects a duplicate like without changing the existing likes', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.create('p1', 'bob')).toThrow(
      new ConflictException('Post already liked by user'),
    );
    expect(likes.findAll()).toEqual([like]);
  });

  it('allows different users to like the same post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p1', 'alice');

    expect(second.id).not.toBe(first.id);
    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('allows a user to like different posts and filters likes by post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p2', 'bob');

    expect(service.findByPost('p1')).toEqual([first]);
    expect(service.findByPost('p2')).toEqual([second]);
    expect(service.findByPost('missing')).toEqual([]);
  });

  it('throws when a like does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
  });

  it('removes the requested like and allows the user to like again', () => {
    const like = service.create('p1', 'bob');
    const other = service.create('p1', 'alice');

    expect(service.remove(like.id)).toBeUndefined();
    expect(likes.findById(like.id)).toBeUndefined();
    expect(service.findByPost('p1')).toEqual([other]);
    expect(service.create('p1', 'bob')).toMatchObject({
      postId: 'p1',
      username: 'bob',
    });
  });

  it('rejects removal of a missing like without deleting anything', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.remove('missing')).toThrow(NotFoundException);
    expect(likes.findAll()).toEqual([like]);
  });
});
