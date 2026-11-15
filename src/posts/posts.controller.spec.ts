import { ConflictException, NotFoundException } from '@nestjs/common';
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

  it('finds a post by id via the service', () => {
    const post = { id: 'post-1', authorId: 'a1', title: 'Title', content: 'Body' };
    const service = { findOne: vi.fn().mockReturnValue(post) } as unknown as PostsService;

    expect(new PostsController(service).findOne('post-1')).toBe(post);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('post-1');
  });

  it('propagates an error when a post cannot be found', () => {
    const error = new NotFoundException('Post missing not found');
    const service = {
      findOne: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as PostsService;

    expect(() => new PostsController(service).findOne('missing')).toThrow(error);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('missing');
  });

  it('removes a post via the service and returns no content', () => {
    const service = { remove: vi.fn() } as unknown as PostsService;

    expect(new PostsController(service).remove('post-1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('post-1');
  });

  it.each([
    new NotFoundException('Post missing not found'),
    new ConflictException('Post still has comments'),
    new ConflictException('Post still has likes'),
  ])('propagates a removal error: %s', (error) => {
    const service = {
      remove: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as PostsService;

    expect(() => new PostsController(service).remove('post-1')).toThrow(error);
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('post-1');
  });
});
