import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { CommentsRepository } from './comments.repository.js';
import { CommentsService } from './comments.service.js';

// Intentionally minimal: only findByPost is covered.
describe('CommentsService', () => {
  it('returns no comments for a post without comments', () => {
    const service = new CommentsService(
      new CommentsRepository(),
      new PostsRepository(),
    );

    expect(service.findByPost('p1')).toEqual([]);
  });
});

describe('CommentsService operations', () => {
  let service: CommentsService;
  let comments: CommentsRepository;
  let posts: PostsRepository;

  beforeEach(() => {
    comments = new CommentsRepository();
    posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    service = new CommentsService(comments, posts);
  });

  it('creates and persists a comment for an existing post', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(comment).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(comment.id).not.toBe('');
    expect(comments.findById(comment.id)).toEqual(comment);
    expect(service.findOne(comment.id)).toEqual(comment);
  });

  it('rejects a comment for an unknown post without saving it', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('lists only comments belonging to the requested post', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    comments.save({
      id: 'other',
      postId: 'p2',
      username: 'alice',
      text: 'Other',
    });

    expect(service.findByPost('p1')).toEqual([comment]);
  });

  it('throws when a comment does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
  });

  it('updates and persists text while preserving the other fields', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const updated = service.update(comment.id, 'Updated');

    expect(updated).toEqual({ ...comment, text: 'Updated' });
    expect(service.findOne(comment.id)).toEqual(updated);
    expect(comments.findAll()).toEqual([updated]);
  });

  it('rejects an update to a missing comment without creating it', () => {
    expect(() => service.update('missing', 'Updated')).toThrow(
      NotFoundException,
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('removes the requested comment and preserves other comments', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const other = service.create('p1', 'alice', 'Other');

    expect(service.remove(comment.id)).toBeUndefined();
    expect(comments.findById(comment.id)).toBeUndefined();
    expect(service.findByPost('p1')).toEqual([other]);
  });

  it('rejects removal of a missing comment without deleting anything', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(() => service.remove('missing')).toThrow(NotFoundException);
    expect(comments.findAll()).toEqual([comment]);
  });
});
