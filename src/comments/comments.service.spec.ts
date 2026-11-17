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

describe('CommentsService mutations and lookups', () => {
  let service: CommentsService;
  let comments: CommentsRepository;

  beforeEach(() => {
    const posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    comments = new CommentsRepository();
    service = new CommentsService(comments, posts);
  });

  it('creates and persists comments with distinct ids', () => {
    const first = service.create('p1', 'bob', 'Hello');
    const second = service.create('p1', 'alice', 'Hi');

    expect(first).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(first.id).not.toBe('');
    expect(second.id).not.toBe(first.id);
    expect(comments.findById(first.id)).toEqual(first);
    expect(service.findByPost('p1')).toEqual([first, second]);
    expect(service.findByPost('another-post')).toEqual([]);
  });

  it('refuses to create a comment for an unknown post without saving it', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      'Post missing not found',
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('finds a comment by id', () => {
    const comment = service.create('p1', 'bob', 'Hello');

    expect(service.findOne(comment.id)).toEqual(comment);
  });

  it('updates only the text and persists it', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const updated = service.update(comment.id, 'Updated');

    expect(updated).toEqual({ ...comment, text: 'Updated' });
    expect(service.findOne(comment.id)).toEqual(updated);
  });

  it('removes only the requested comment', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const remaining = service.create('p1', 'alice', 'Hi');

    expect(service.remove(comment.id)).toBeUndefined();
    expect(comments.findById(comment.id)).toBeUndefined();
    expect(service.findByPost('p1')).toEqual([remaining]);
  });

  it.each(['findOne', 'update', 'remove'] as const)(
    'rejects %s for a missing comment without changing stored comments',
    (method) => {
      const comment = service.create('p1', 'bob', 'Hello');

      expect(() => service[method]('missing', 'Updated')).toThrow(
        'Comment missing not found',
      );
      expect(comments.findAll()).toEqual([comment]);
    },
  );
});
