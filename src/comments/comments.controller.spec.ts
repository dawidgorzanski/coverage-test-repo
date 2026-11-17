import { NotFoundException } from '@nestjs/common';
import type { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

describe('CommentsController', () => {
  it('creates via the service', () => {
    const record = { id: '1', postId: 'p1', username: 'bob', text: 'Hello' };
    const service = {
      create: vi.fn().mockReturnValue(record),
    } as unknown as CommentsService;
    expect(
      new CommentsController(service).create({
        postId: 'p1',
        username: 'bob',
        text: 'Hello',
      }),
    ).toBe(record);
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'bob',
      'Hello',
    );
  });
  it('lists via the service', () => {
    const records = [{ id: '1', postId: 'p1', username: 'bob', text: 'Hello' }];
    const service = {
      findByPost: vi.fn().mockReturnValue(records),
    } as unknown as CommentsService;
    expect(new CommentsController(service).findByPost('p1')).toBe(records);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });
  it('finds a record by id via the service', () => {
    const record = { id: '1', postId: 'p1', username: 'bob', text: 'Hello' };
    const service = {
      findOne: vi.fn().mockReturnValue(record),
    } as unknown as CommentsService;
    expect(new CommentsController(service).findOne('1')).toBe(record);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('1');
  });
  it('removes via the service', () => {
    const service = { remove: vi.fn() } as unknown as CommentsService;
    expect(new CommentsController(service).remove('1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('1');
  });
  it('propagates a service error', () => {
    const error = new NotFoundException('Missing record');
    const service = {
      findOne: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as CommentsService;
    expect(() => new CommentsController(service).findOne('missing')).toThrow(
      error,
    );
  });
  it('updates via the service', () => {
    const record = {
      ...{ id: '1', postId: 'p1', username: 'bob', text: 'Hello' },
      ...{ text: 'Updated' },
    };
    const service = {
      update: vi.fn().mockReturnValue(record),
    } as unknown as CommentsService;
    expect(
      new CommentsController(service).update('1', { text: 'Updated' }),
    ).toBe(record);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('1', 'Updated');
  });
});
