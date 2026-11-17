import { NotFoundException } from '@nestjs/common';
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

describe('LikesService mutations and lookups', () => {
  let service: LikesService;
  let likes: LikesRepository;

  beforeEach(() => {
    const posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    posts.save({ id: 'p2', authorId: 'a1', title: 'Other', content: 'Body' });
    likes = new LikesRepository();
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

  it('rejects a duplicate like without changing stored likes', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.create('p1', 'bob')).toThrow(
      'Post already liked by user',
    );
    expect(likes.findAll()).toEqual([like]);
  });

  it('allows different users on the same post and the same user on another post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p1', 'alice');
    const otherPost = service.create('p2', 'bob');

    expect(new Set([first.id, second.id, otherPost.id]).size).toBe(3);
    expect(service.findByPost('p1')).toEqual([first, second]);
    expect(service.findByPost('p2')).toEqual([otherPost]);
    expect(service.findByPost('missing')).toEqual([]);
  });

  it('removes only the requested like and permits liking again', () => {
    const like = service.create('p1', 'bob');
    const remaining = service.create('p1', 'alice');

    expect(service.remove(like.id)).toBeUndefined();
    expect(likes.findById(like.id)).toBeUndefined();
    expect(service.findByPost('p1')).toEqual([remaining]);
    expect(service.create('p1', 'bob')).toMatchObject({
      postId: 'p1',
      username: 'bob',
    });
  });

  it.each(['findOne', 'remove'] as const)(
    'rejects %s for a missing like without changing stored likes',
    (method) => {
      const like = service.create('p1', 'bob');

      expect(() => service[method]('missing')).toThrow(
        'Like missing not found',
      );
      expect(likes.findAll()).toEqual([like]);
    },
  );
});
