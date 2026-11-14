import type { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

describe('CommentsController delegation', () => {
  let controller: CommentsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

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

  it('delegates create and returns the service result', () => {
    const result = { id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' };
    service.create.mockReturnValue(result);

    expect(
      controller.create({ postId: 'p1', username: 'bob', text: 'Hello' }),
    ).toBe(result);
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'bob',
      'Hello',
    );
  });

  it('delegates findByPost and returns the service result', () => {
    const result = [{ id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' }];
    service.findByPost.mockReturnValue(result);

    expect(controller.findByPost('p1')).toBe(result);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('delegates findOne and returns the service result', () => {
    const result = { id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' };
    service.findOne.mockReturnValue(result);

    expect(controller.findOne('c1')).toBe(result);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('c1');
  });

  it('delegates update and returns the service result', () => {
    const result = { id: 'c1', postId: 'p1', username: 'bob', text: 'Updated' };
    service.update.mockReturnValue(result);

    expect(controller.update('c1', { text: 'Updated' })).toBe(result);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('c1', 'Updated');
  });

  it('delegates removal and returns no value', () => {
    expect(controller.remove('c1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('c1');
  });
});
