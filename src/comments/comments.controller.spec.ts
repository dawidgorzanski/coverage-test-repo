import { NotFoundException } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import type { CommentsService } from './comments.service.js';

describe('CommentsController', () => {
  const comment = { id: 'c1', postId: 'p1', username: 'alice', text: 'A comment' };
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let controller: CommentsController;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findByPost: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    controller = new CommentsController(service as unknown as CommentsService);
  });

  it('creates a comment via the service', () => {
    service.create.mockReturnValue(comment);

    expect(controller.create({ postId: 'p1', username: 'alice', text: 'A comment' })).toBe(comment);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'alice', 'A comment');
  });

  it('returns comments for the requested post', () => {
    const comments = [comment];
    service.findByPost.mockReturnValue(comments);

    expect(controller.findByPost('p1')).toBe(comments);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('returns an empty list for a post without comments', () => {
    service.findByPost.mockReturnValue([]);

    expect(controller.findByPost('empty-post')).toEqual([]);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('empty-post');
  });

  it('returns the requested comment', () => {
    service.findOne.mockReturnValue(comment);

    expect(controller.findOne('c1')).toBe(comment);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('c1');
  });

  it('updates the requested comment text via the service', () => {
    const updated = { ...comment, text: 'Updated comment' };
    service.update.mockReturnValue(updated);

    expect(controller.update('c1', { text: 'Updated comment' })).toBe(updated);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('c1', 'Updated comment');
  });

  it('removes the requested comment without returning a response body', () => {
    expect(controller.remove('c1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('c1');
  });

  it('propagates the service error when creating a comment for a missing post', () => {
    const error = new NotFoundException('Post missing not found');
    service.create.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.create({ postId: 'missing', username: 'alice', text: 'Hello' })).toThrow(error);
  });

  it.each(['findOne', 'update', 'remove'] as const)(
    'propagates the service error when %s receives a missing comment',
    (method) => {
      const error = new NotFoundException('Comment missing not found');
      service[method].mockImplementation(() => {
        throw error;
      });

      expect(() => {
        if (method === 'update') {
          controller.update('missing', { text: 'Updated comment' });
        } else {
          controller[method]('missing');
        }
      }).toThrow(error);
    },
  );
});
