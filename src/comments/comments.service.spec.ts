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

  it('creates and persists comments with unique ids', () => {
    const first = service.create('p1', 'bob', 'Hello');
    const second = service.create('p1', 'bob', 'Hello again');

    expect(first).toEqual({
      id: expect.any(String),
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(first.id).not.toBe('');
    expect(second.id).not.toBe(first.id);
    expect(comments.findById(first.id)).toEqual(first);
    expect(service.findOne(first.id)).toEqual(first);
  });

  it('rejects comments on unknown posts without saving them', () => {
    expect(() => service.create('missing', 'bob', 'Hello')).toThrow(
      'Post missing not found',
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('returns only comments for the requested post', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    comments.save({
      id: 'other',
      postId: 'p2',
      username: 'ada',
      text: 'Other',
    });

    expect(service.findByPost('p1')).toEqual([comment]);
    expect(service.findByPost('missing')).toEqual([]);
  });

  it('reports a missing comment', () => {
    expect(() => service.findOne('missing')).toThrow(
      'Comment missing not found',
    );
  });

  it('updates the text while preserving the other fields and persists it', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const updated = service.update(comment.id, 'Updated');

    expect(updated).toEqual({ ...comment, text: 'Updated' });
    expect(comments.findById(comment.id)).toEqual(updated);
  });

  it('does not create a comment when updating an unknown id', () => {
    expect(() => service.update('missing', 'Updated')).toThrow(
      'Comment missing not found',
    );
    expect(comments.findAll()).toEqual([]);
  });

  it('removes the requested comment and preserves others', () => {
    const comment = service.create('p1', 'bob', 'Hello');
    const retained = service.create('p1', 'ada', 'Keep');

    expect(service.remove(comment.id)).toBeUndefined();
    expect(comments.findById(comment.id)).toBeUndefined();
    expect(service.findByPost('p1')).toEqual([retained]);
  });

  it('rejects removal of a missing comment without deleting anything', () => {
    const comment = service.create('p1', 'bob', 'Keep');
    const deleteComment = vi.spyOn(comments, 'delete');

    expect(() => service.remove('missing')).toThrow(
      'Comment missing not found',
    );
    expect(deleteComment).not.toHaveBeenCalled();
    expect(comments.findAll()).toEqual([comment]);
  });
});
