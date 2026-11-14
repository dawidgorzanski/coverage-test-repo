import type { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';

describe('PostsController', () => {
  it('lists posts via the service', () => {
    const service = { findAll: vi.fn().mockReturnValue([]) } as unknown as PostsService;

    expect(new PostsController(service).findAll()).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('creates a post via the service', () => {
    const post = { id: '1', authorId: 'a1', title: 'T', content: 'C' };
    const service = { create: vi.fn().mockReturnValue(post) } as unknown as PostsService;

    const result = new PostsController(service).create({ authorId: 'a1', title: 'T', content: 'C' });

    expect(result).toBe(post);
    expect(service.create).toHaveBeenCalledWith('a1', 'T', 'C');
  });

  it('updates a post via the service', () => {
    const post = { id: '1', authorId: 'a1', title: 'New', content: 'Body' };
    const service = { update: vi.fn().mockReturnValue(post) } as unknown as PostsService;

    const result = new PostsController(service).update('1', { title: 'New', content: 'Body' });

    expect(result).toBe(post);
    expect(service.update).toHaveBeenCalledWith('1', 'New', 'Body');
  });
});
