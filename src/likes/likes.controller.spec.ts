import { NotFoundException } from '@nestjs/common';
import type { LikesService } from './likes.service.js';
import { LikesController } from './likes.controller.js';

describe('LikesController', () => {
  it('creates via the service', () => {
    const record = { id: '1', postId: 'p1', username: 'bob' };
    const service = {
      create: vi.fn().mockReturnValue(record),
    } as unknown as LikesService;
    expect(
      new LikesController(service).create({ postId: 'p1', username: 'bob' }),
    ).toBe(record);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'bob');
  });
  it('lists via the service', () => {
    const records = [{ id: '1', postId: 'p1', username: 'bob' }];
    const service = {
      findByPost: vi.fn().mockReturnValue(records),
    } as unknown as LikesService;
    expect(new LikesController(service).findByPost('p1')).toBe(records);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });
  it('finds a record by id via the service', () => {
    const record = { id: '1', postId: 'p1', username: 'bob' };
    const service = {
      findOne: vi.fn().mockReturnValue(record),
    } as unknown as LikesService;
    expect(new LikesController(service).findOne('1')).toBe(record);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('1');
  });
  it('removes via the service', () => {
    const service = { remove: vi.fn() } as unknown as LikesService;
    expect(new LikesController(service).remove('1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('1');
  });
  it('propagates a service error', () => {
    const error = new NotFoundException('Missing record');
    const service = {
      findOne: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as LikesService;
    expect(() => new LikesController(service).findOne('missing')).toThrow(
      error,
    );
  });
});
