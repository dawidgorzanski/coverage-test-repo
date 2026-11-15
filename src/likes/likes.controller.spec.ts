import { NotFoundException } from '@nestjs/common';
import { LikesController } from './likes.controller.js';
import type { LikesService } from './likes.service.js';

describe('LikesController', () => {
  const like = { id: 'l1', postId: 'p1', username: 'bob' };
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let controller: LikesController;

  beforeEach(() => {
    service = {
      create: vi.fn().mockReturnValue(like),
      findByPost: vi.fn().mockReturnValue([like]),
      findOne: vi.fn().mockReturnValue(like),
      remove: vi.fn(),
    };
    controller = new LikesController(service as unknown as LikesService);
  });

  it('creates a like via the service', () => {
    expect(controller.create({ postId: 'p1', username: 'bob' })).toBe(like);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'bob');
  });

  it('lists likes for the requested post via the service', () => {
    const likes = [like];
    service.findByPost.mockReturnValue(likes);

    expect(controller.findByPost('p1')).toBe(likes);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('finds a like by id via the service', () => {
    expect(controller.findOne('l1')).toBe(like);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('l1');
  });

  it('removes a like via the service', () => {
    expect(controller.remove('l1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('l1');
  });

  it('propagates a service error when removing a missing like', () => {
    const error = new NotFoundException('Like missing not found');
    service.remove.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.remove('missing')).toThrow(error);
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('missing');
  });
});
