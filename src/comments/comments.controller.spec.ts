import { NotFoundException } from '@nestjs/common';
import type { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

describe('CommentsController', () => {
  it('creates a comment via the service', () => {
    const comment = { id: 'c1', postId: 'p1', username: 'Ada', text: 'Hello' };
    const service = { create: vi.fn().mockReturnValue(comment) } as unknown as CommentsService;

    const result = new CommentsController(service).create({
      postId: 'p1',
      username: 'Ada',
      text: 'Hello',
    });

    expect(result).toBe(comment);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'Ada', 'Hello');
  });

  it('lists comments for the requested post via the service', () => {
    const comments = [{ id: 'c1', postId: 'p1', username: 'Ada', text: 'Hello' }];
    const service = { findByPost: vi.fn().mockReturnValue(comments) } as unknown as CommentsService;

    expect(new CommentsController(service).findByPost('p1')).toBe(comments);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('finds a comment by id via the service', () => {
    const comment = { id: 'c1', postId: 'p1', username: 'Ada', text: 'Hello' };
    const service = { findOne: vi.fn().mockReturnValue(comment) } as unknown as CommentsService;

    expect(new CommentsController(service).findOne('c1')).toBe(comment);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('c1');
  });

  it('updates a comment via the service', () => {
    const comment = { id: 'c1', postId: 'p1', username: 'Ada', text: 'Updated' };
    const service = { update: vi.fn().mockReturnValue(comment) } as unknown as CommentsService;

    expect(new CommentsController(service).update('c1', { text: 'Updated' })).toBe(comment);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('c1', 'Updated');
  });

  it('removes a comment via the service', () => {
    const service = { remove: vi.fn() } as unknown as CommentsService;

    expect(new CommentsController(service).remove('c1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('c1');
  });

  it('propagates a missing post error when creating a comment', () => {
    const error = new NotFoundException('Post missing not found');
    const service = {
      create: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as CommentsService;

    expect(() =>
      new CommentsController(service).create({ postId: 'missing', username: 'Ada', text: 'Hello' }),
    ).toThrow(error);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('missing', 'Ada', 'Hello');
  });

  it('propagates a missing comment error from the service', () => {
    const error = new NotFoundException('Comment missing not found');
    const service = {
      findOne: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as CommentsService;

    expect(() => new CommentsController(service).findOne('missing')).toThrow(error);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('missing');
  });
});
