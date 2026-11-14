import type { LikesService } from './likes.service.js';
import { LikesController } from './likes.controller.js';

describe('LikesController delegation', () => {
  let controller: LikesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findByPost: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };
    controller = new LikesController(service as unknown as LikesService);
  });

  it('delegates create and returns the service result', () => {
    const result = { id: 'l1', postId: 'p1', username: 'bob' };
    service.create.mockReturnValue(result);

    expect(controller.create({ postId: 'p1', username: 'bob' })).toBe(result);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'bob');
  });

  it('delegates findByPost and returns the service result', () => {
    const result = [{ id: 'l1', postId: 'p1', username: 'bob' }];
    service.findByPost.mockReturnValue(result);

    expect(controller.findByPost('p1')).toBe(result);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('delegates findOne and returns the service result', () => {
    const result = { id: 'l1', postId: 'p1', username: 'bob' };
    service.findOne.mockReturnValue(result);

    expect(controller.findOne('l1')).toBe(result);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('l1');
  });

  it('delegates removal and returns no value', () => {
    expect(controller.remove('l1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('l1');
  });
});
