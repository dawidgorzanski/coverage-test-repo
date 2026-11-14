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

describe('CommentsService comment lifecycle', () => {
  let service: CommentsService;
  let comments: CommentsRepository;
  let posts: PostsRepository;

  beforeEach(() => {
    comments = new CommentsRepository();
    posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    service = new CommentsService(comments, posts);
  });

  it('creates and persists a comment with a unique id', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const another = service.create('p1', 'bob', 'Hello again');

    expect(comment).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(comment.id).not.toBe('');
    expect(another.id).not.toBe(comment.id);
    expect(comments.findById(comment.id)).toEqual(comment);
    expect(comments.findById(another.id)).toEqual(another);
  });

  it('rejects a comment for an unknown post without saving it', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('returns only comments belonging to the requested post', () => {
    const first = service.create('p1', 'bob', 'First');
    const second = service.create('p1', 'ada', 'Second');
    comments.save({
      id: 'other',
      postId: 'p2',
      username: 'bob',
      text: 'Other',
    });

    expect(service.findByPost('p1')).toEqual([first, second]);
    expect(service.findByPost('missing')).toEqual([]);
  });

  it('finds a comment by id', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(service.findOne(comment.id)).toEqual(comment);
  });

  it('throws when the requested comment does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
  });

  it('updates and persists text while preserving the other fields', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(service.update(comment.id, 'Edited')).toEqual({
      ...comment,
      text: 'Edited',
    });
    expect(comments.findById(comment.id)).toEqual({
      ...comment,
      text: 'Edited',
    });
  });

  it('does not create a comment when updating an unknown id', () => {
    expect(() => service.update('missing', 'Edited')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('removes only the requested comment', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const remaining = service.create('p1', 'ada', 'Keep');

    expect(service.remove(comment.id)).toBeUndefined();

    expect(comments.findById(comment.id)).toBeUndefined();
    expect(comments.findAll()).toEqual([remaining]);
  });

  it('throws when removing an unknown comment without changing stored comments', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(comments.findAll()).toEqual([comment]);
  });
});
