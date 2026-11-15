import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { CommentsRepository } from './comments.repository.js';
import { CommentsService } from './comments.service.js';

describe('CommentsService', () => {
  let service: CommentsService;
  let comments: CommentsRepository;
  let posts: PostsRepository;

  beforeEach(() => {
    comments = new CommentsRepository();
    posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    service = new CommentsService(comments, posts);
  });

  it('returns no comments for a post without comments', () => {
    const service = new CommentsService(new CommentsRepository(), new PostsRepository());

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
    expect(comments.findById(first.id)).toEqual(first);
    expect(comments.findById(second.id)).toEqual(second);
  });

  it('refuses to create a comment for an unknown post without saving it', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      new NotFoundException('Post missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('returns only comments belonging to the requested post', () => {
    const first = comments.save({ id: 'c1', postId: 'p1', username: 'bob', text: 'Hi' });
    const second = comments.save({ id: 'c2', postId: 'p1', username: 'ada', text: 'Hello' });
    comments.save({ id: 'c3', postId: 'p2', username: 'bob', text: 'Other' });

    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('finds a comment by id', () => {
    const comment = comments.save({ id: 'c1', postId: 'p1', username: 'bob', text: 'Hi' });

    expect(service.findOne('c1')).toEqual(comment);
  });

  it('throws when a comment does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
  });

  it('updates and persists the text while preserving the other comment fields', () => {
    const comment = comments.save({ id: 'c1', postId: 'p1', username: 'bob', text: 'Hi' });

    const updated = service.update('c1', 'Edited');

    expect(updated).toEqual({ ...comment, text: 'Edited' });
    expect(comments.findById('c1')).toEqual(updated);
  });

  it('refuses to update an unknown comment without saving it', () => {
    expect(() => service.update('missing', 'Edited')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('removes only the requested comment', () => {
    comments.save({ id: 'c1', postId: 'p1', username: 'bob', text: 'Hi' });
    const remaining = comments.save({ id: 'c2', postId: 'p1', username: 'ada', text: 'Hello' });

    expect(service.remove('c1')).toBeUndefined();

    expect(comments.findById('c1')).toBeUndefined();
    expect(comments.findAll()).toEqual([remaining]);
  });

  it('refuses to remove an unknown comment before calling delete', () => {
    const deleteComment = vi.spyOn(comments, 'delete');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Comment missing not found'),
    );
    expect(deleteComment).not.toHaveBeenCalled();
  });
});
