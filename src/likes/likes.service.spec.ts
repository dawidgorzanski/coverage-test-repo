import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { LikesRepository } from './likes.repository.js';
import { LikesService } from './likes.service.js';

describe('LikesService', () => {
  let service: LikesService;
  let likes: LikesRepository;

  beforeEach(() => {
    likes = new LikesRepository();
    const posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'First', content: 'Body' });
    posts.save({ id: 'p2', authorId: 'a1', title: 'Second', content: 'Body' });
    service = new LikesService(likes, posts);
  });

  it('creates and persists a like', () => {
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

  it('refuses duplicate likes by the same user without saving another like', () => {
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

  it('removes only the requested like and allows the user to like again', () => {
    const like = service.create('p1', 'bob');
    const remaining = service.create('p1', 'alice');

    service.remove(like.id);

    expect(likes.findAll()).toEqual([remaining]);
    expect(() => service.findOne(like.id)).toThrow(NotFoundException);
    expect(service.create('p1', 'bob')).toMatchObject({
      postId: 'p1',
      username: 'bob',
    });
  });

  it('refuses to remove a missing like without removing existing likes', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.remove('missing')).toThrow(NotFoundException);
    expect(likes.findAll()).toEqual([like]);
  });

  it('refuses to like an unknown post', () => {
    const service = new LikesService(
      new LikesRepository(),
      new PostsRepository(),
    );

    expect(() => service.create('missing', 'bob')).toThrow(NotFoundException);
  });
});
