import { NotFoundException } from '@nestjs/common';
import type { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

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
    const updated = { ...comment, text: 'Updated text' };
    service.update.mockReturnValue(updated);

    expect(controller.update('c1', { text: 'Updated text' })).toBe(updated);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('c1', 'Updated text');
  });

  it('removes the requested comment via the service', () => {
    expect(controller.remove('c1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('c1');
  });

  it.each(['create', 'findOne', 'update', 'remove'] as const)(
    'propagates a not-found error from %s',
    (method) => {
      const error = new NotFoundException('Not found');
      service[method].mockImplementation(() => {
        throw error;
      });
      const actions = {
        create: () => controller.create({ postId: 'missing', username: 'alice', text: 'Text' }),
        findOne: () => controller.findOne('missing'),
        update: () => controller.update('missing', { text: 'Updated' }),
        remove: () => controller.remove('missing'),
      };

      expect(actions[method]).toThrow(error);
    },
  );
});
