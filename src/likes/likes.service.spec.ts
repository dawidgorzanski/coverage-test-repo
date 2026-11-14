import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { LikesRepository } from './likes.repository.js';
import { LikesService } from './likes.service.js';

describe('LikesService', () => {
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

  it('refuses to like an unknown post', () => {
    const service = new LikesService(new LikesRepository(), new PostsRepository());

    expect(() => service.create('missing', 'bob')).toThrow(NotFoundException);
  });

  it('creates and saves a like for an existing post', () => {
    const like = service.create('p1', 'bob');

    expect(like).toEqual({ id: expect.any(String), postId: 'p1', username: 'bob' });
    expect(like.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(likes.findById(like.id)).toEqual(like);
  });

  it('refuses duplicate likes by the same user on a post', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.create('p1', 'bob')).toThrow(
      new ConflictException('Post already liked by user'),
    );
    expect(likes.findAll()).toEqual([like]);
  });

  it('allows different users to like the same post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p1', 'alice');

    expect(second.username).toBe('alice');
    expect(second.id).not.toBe(first.id);
    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('allows the same user to like different posts and filters likes by post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p2', 'bob');

    expect(service.findByPost('p1')).toEqual([first]);
    expect(service.findByPost('p2')).toEqual([second]);
  });

  it('returns no likes when a post has none', () => {
    expect(service.findByPost('p1')).toEqual([]);
  });

  it('finds a like by id', () => {
    const like = service.create('p1', 'bob');

    expect(service.findOne(like.id)).toEqual(like);
  });

  it('throws when a like does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
  });

  it('removes a like while preserving other likes', () => {
    const removed = service.create('p1', 'bob');
    const retained = service.create('p1', 'alice');

    expect(service.remove(removed.id)).toBeUndefined();

    expect(likes.findById(removed.id)).toBeUndefined();
    expect(likes.findAll()).toEqual([retained]);
  });

  it('refuses to remove a missing like without changing existing likes', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
    expect(likes.findAll()).toEqual([like]);
  });
});
