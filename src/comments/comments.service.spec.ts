import { PostsRepository } from '../posts/posts.repository.js';
import { CommentsRepository } from './comments.repository.js';
import { CommentsService } from './comments.service.js';

describe('CommentsService', () => {
  let service: CommentsService;
  let comments: CommentsRepository;

  beforeEach(() => {
    comments = new CommentsRepository();
    const posts = new PostsRepository();
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

  it('refuses to comment on an unknown post without saving', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('lists only comments belonging to the requested post', () => {
    const first = service.create('p1', 'bob', 'First');
    const second = service.create('p1', 'alice', 'Second');
    comments.save({
      id: 'other',
      postId: 'p2',
      username: 'bob',
      text: 'Other',
    });

    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('throws when a comment does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
  });

  it('updates the text while preserving the comment identity and author', () => {
    const comment = service.create('p1', 'bob', 'Before');

    expect(service.update(comment.id, 'After')).toEqual({
      ...comment,
      text: 'After',
    });
    expect(comments.findAll()).toEqual([{ ...comment, text: 'After' }]);
  });

  it('refuses to update a missing comment without creating one', () => {
    expect(() => service.update('missing', 'After')).toThrow(NotFoundException);
    expect(comments.findAll()).toEqual([]);
  });

  it('removes only the requested comment', () => {
    const comment = service.create('p1', 'bob', 'Remove');
    const remaining = service.create('p1', 'alice', 'Keep');

    service.remove(comment.id);

    expect(comments.findAll()).toEqual([remaining]);
    expect(() => service.findOne(comment.id)).toThrow(NotFoundException);
  });

  it('refuses to remove a missing comment', () => {
    const comment = service.create('p1', 'bob', 'Keep');

    expect(() => service.remove('missing')).toThrow(NotFoundException);
    expect(comments.findAll()).toEqual([comment]);
  });

  it('returns no comments for a post without comments', () => {
    const service = new CommentsService(
      new CommentsRepository(),
      new PostsRepository(),
    );

    expect(service.findByPost('p1')).toEqual([]);
  });
});
import { NotFoundException } from '@nestjs/common';
