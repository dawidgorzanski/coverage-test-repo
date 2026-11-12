import { PostsRepository } from '../posts/posts.repository.js';
import { CommentsRepository } from './comments.repository.js';
import { CommentsService } from './comments.service.js';

// Intentionally minimal: only findByPost is covered.
describe('CommentsService', () => {
  it('returns no comments for a post without comments', () => {
    const service = new CommentsService(new CommentsRepository(), new PostsRepository());

    expect(service.findByPost('p1')).toEqual([]);
  });
});
