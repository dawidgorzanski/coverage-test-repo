import type { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';

describe('PostsController', () => {
  it('lists posts via the service', () => {
    const service = { findAll: vi.fn().mockReturnValue([]) } as unknown as PostsService;

    expect(new PostsController(service).findAll()).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });
});
