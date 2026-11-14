import { NotFoundException } from '@nestjs/common';
import { LikesController } from './likes.controller.js';
import type { LikesService } from './likes.service.js';

describe('LikesController', () => {
  it('creates a like via the service', () => {
    const like = { id: 'like-1', postId: 'post-1', username: 'bob' };
    const service = { create: vi.fn().mockReturnValue(like) } as unknown as LikesService;

    const result = new LikesController(service).create({ postId: 'post-1', username: 'bob' });

    expect(result).toBe(like);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('post-1', 'bob');
  });

  it('lists likes for the requested post via the service', () => {
    const likes = [{ id: 'like-1', postId: 'post-1', username: 'bob' }];
    const service = { findByPost: vi.fn().mockReturnValue(likes) } as unknown as LikesService;

    expect(new LikesController(service).findByPost('post-1')).toBe(likes);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('post-1');
  });

  it('returns an empty list when the service finds no likes', () => {
    const service = { findByPost: vi.fn().mockReturnValue([]) } as unknown as LikesService;

    expect(new LikesController(service).findByPost('post-2')).toEqual([]);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('post-2');
  });

  it('finds a like by its id via the service', () => {
    const like = { id: 'like-1', postId: 'post-1', username: 'bob' };
    const service = { findOne: vi.fn().mockReturnValue(like) } as unknown as LikesService;

    expect(new LikesController(service).findOne('like-1')).toBe(like);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('like-1');
  });

  it('removes a like via the service and returns no value', () => {
    const service = { remove: vi.fn() } as unknown as LikesService;

    expect(new LikesController(service).remove('like-1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('like-1');
  });

  it('propagates errors when a like cannot be found', () => {
    const error = new NotFoundException('Like missing not found');
    const service = {
      findOne: vi.fn().mockImplementation(() => { throw error; }),
    } as unknown as LikesService;

    expect(() => new LikesController(service).findOne('missing')).toThrow(error);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('missing');
  });

  it('propagates errors when a like cannot be removed', () => {
    const error = new NotFoundException('Like missing not found');
    const service = {
      remove: vi.fn().mockImplementation(() => { throw error; }),
    } as unknown as LikesService;

    expect(() => new LikesController(service).remove('missing')).toThrow(error);
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('missing');
  });
});
