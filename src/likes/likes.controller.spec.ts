import type { LikesService } from './likes.service.js';
import { LikesController } from './likes.controller.js';

describe('LikesController delegation', () => {
  const item = { id: 'l1', postId: 'p1', username: 'bob' };
  let controller: LikesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn().mockReturnValue(item),
      findByPost: vi.fn().mockReturnValue([item]),
      findOne: vi.fn().mockReturnValue(item),
      remove: vi.fn(),
    };
    controller = new LikesController(service as unknown as LikesService);
  });

  it('creates through the service with the body fields', () => {
    expect(controller.create({ postId: 'p1', username: 'bob' })).toBe(item);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'bob');
  });

  it('lists through the service', () => {
    expect(controller.findByPost('p1')).toEqual([item]);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('finds by id through the service', () => {
    expect(controller.findOne(item.id)).toBe(item);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith(item.id);
  });

  it('removes by id through the service', () => {
    expect(controller.remove(item.id)).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith(item.id);
  });
});
