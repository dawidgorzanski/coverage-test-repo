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

describe('LikesService like lifecycle', () => {
  let service: LikesService;
  let likes: LikesRepository;
  let posts: PostsRepository;

  beforeEach(() => {
    likes = new LikesRepository();
    posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    posts.save({ id: 'p2', authorId: 'a1', title: 'Other', content: 'Body' });
    service = new LikesService(likes, posts);
  });

  it('creates and persists a like with an id', () => {
    const like = service.create('p1', 'bob');

    expect(like).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
    });
    expect(like.id).not.toBe('');
    expect(likes.findById(like.id)).toEqual(like);
  });

  it('rejects duplicate likes from the same user without saving another like', () => {
    service.create('p1', 'ada');
    service.create('p1', 'bob');
    const before = likes.findAll();

    expect(() => service.create('p1', 'bob')).toThrow(
      new ConflictException('Post already liked by user'),
    );
    expect(likes.findAll()).toEqual(before);
  });

  it('allows different users to like the same post with distinct ids', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p1', 'ada');

    expect(first.id).not.toBe(second.id);
    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('allows a user to like different posts and filters likes by post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p2', 'bob');

    expect(service.findByPost('p1')).toEqual([first]);
    expect(service.findByPost('p2')).toEqual([second]);
    expect(service.findByPost('missing')).toEqual([]);
  });

  it('does not save a like for a missing post', () => {
    expect(() => service.create('missing', 'bob')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(likes.findAll()).toEqual([]);
  });

  it('finds a like by id', () => {
    const like = service.create('p1', 'bob');

    expect(service.findOne(like.id)).toEqual(like);
  });

  it('throws when the requested like does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
  });

  it('removes only the requested like and allows liking again', () => {
    const like = service.create('p1', 'bob');
    const remaining = service.create('p1', 'ada');

    expect(service.remove(like.id)).toBeUndefined();

    expect(likes.findById(like.id)).toBeUndefined();
    expect(likes.findAll()).toEqual([remaining]);
    const replacement = service.create('p1', 'bob');
    expect(service.findByPost('p1')).toEqual([remaining, replacement]);
  });

  it('throws when removing an unknown like without changing stored likes', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
    expect(likes.findAll()).toEqual([like]);
  });
});
