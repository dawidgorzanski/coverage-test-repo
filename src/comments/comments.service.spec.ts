import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { CommentsRepository } from './comments.repository.js';
import { CommentsService } from './comments.service.js';

describe('CommentsService', () => {
  let service: CommentsService;
  let comments: CommentsRepository;

  beforeEach(() => {
    const posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    comments = new CommentsRepository();
    service = new CommentsService(comments, posts);
  });

  it('returns no comments for a post without comments', () => {
    expect(service.findByPost('p1')).toEqual([]);
  });

  it('creates and persists comments with unique UUIDs for an existing post', () => {
    const first = service.create('p1', 'bob', 'Hello');
    const second = service.create('p1', 'ada', 'Hi');

    expect(first).toEqual({
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(second.id).not.toBe(first.id);
    expect(comments.findAll()).toEqual([first, second]);
  });

  it('refuses to create a comment for an unknown post without saving it', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('returns only comments belonging to the requested post', () => {
    const first = service.create('p1', 'bob', 'Hello');
    const second = service.create('p1', 'ada', 'Hi');
    comments.save({
      id: 'other',
      postId: 'p2',
      username: 'bob',
      text: 'Other post',
    });

    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('finds a comment by id', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(service.findOne(comment.id)).toEqual(comment);
  });

  it('throws when a comment does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
  });

  it('updates and persists the text while preserving the comment details', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const other = service.create('p1', 'ada', 'Hi');

    const updated = service.update(comment.id, 'Edited');

    expect(updated).toEqual({ ...comment, text: 'Edited' });
    expect(comments.findAll()).toEqual([updated, other]);
  });

  it('refuses to update a missing comment without changing stored comments', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(() => service.update('missing', 'Edited')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(comments.findAll()).toEqual([comment]);
  });

  it('removes the requested comment and preserves other comments', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const other = service.create('p1', 'ada', 'Hi');

    expect(service.remove(comment.id)).toBeUndefined();

    expect(comments.findById(comment.id)).toBeUndefined();
    expect(comments.findAll()).toEqual([other]);
  });

  it('refuses to remove a missing comment without changing stored comments', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(comments.findAll()).toEqual([comment]);
  });
});
