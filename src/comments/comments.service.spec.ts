import { PostsRepository } from '../posts/posts.repository.js';
import { CommentsRepository } from './comments.repository.js';
import { CommentsService } from './comments.service.js';

describe('CommentsService', () => {
  let comments: CommentsRepository;
  let service: CommentsService;

  beforeEach(() => {
    const posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    comments = new CommentsRepository();
    service = new CommentsService(comments, posts);
  });

  it('returns no comments for a post without comments', () => {
    const service = new CommentsService(
      new CommentsRepository(),
      new PostsRepository(),
    );

    expect(service.findByPost('p1')).toEqual([]);
  });

  it('creates and saves a comment for an existing post', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(comment).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(comment.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(comments.findById(comment.id)).toEqual(comment);
  });

  it('refuses to create a comment for an unknown post', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('returns only comments belonging to the requested post', () => {
    const comment = comments.save({
      id: 'c1',
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    comments.save({ id: 'c2', postId: 'p2', username: 'ada', text: 'Other' });

    expect(service.findByPost('p1')).toEqual([comment]);
  });

  it('finds a comment by id', () => {
    const comment = comments.save({
      id: 'c1',
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });

    expect(service.findOne('c1')).toEqual(comment);
  });

  it('throws when a comment does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
  });

  it('updates and saves the text while preserving the other comment fields', () => {
    const comment = comments.save({
      id: 'c1',
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });

    expect(service.update('c1', 'Updated')).toEqual({
      ...comment,
      text: 'Updated',
    });
    expect(comments.findById('c1')).toEqual({ ...comment, text: 'Updated' });
  });

  it('refuses to update a missing comment without saving it', () => {
    expect(() => service.update('missing', 'Updated')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('removes only the requested comment', () => {
    comments.save({ id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' });
    const other = comments.save({
      id: 'c2',
      postId: 'p1',
      username: 'ada',
      text: 'Keep',
    });

    expect(service.remove('c1')).toBeUndefined();
    expect(comments.findById('c1')).toBeUndefined();
    expect(comments.findAll()).toEqual([other]);
  });

  it('refuses to remove a missing comment', () => {
    const deleteComment = vi.spyOn(comments, 'delete');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(deleteComment).not.toHaveBeenCalled();
  });
});
import { NotFoundException } from '@nestjs/common';
