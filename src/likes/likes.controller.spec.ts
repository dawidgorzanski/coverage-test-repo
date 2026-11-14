import type { LikesService } from './likes.service.js';
import { LikesController } from './likes.controller.js';

describe('LikesController delegation', () => {
  const entity = { id: 'l1', postId: 'p1', username: 'bob' };
  let controller: LikesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  beforeEach(() => {
    service = {
      create: vi.fn().mockReturnValue(entity),
      findByPost: vi.fn().mockReturnValue([entity]),
      findOne: vi.fn().mockReturnValue(entity),
      remove: vi.fn().mockReturnValue(undefined),
    };
    controller = new LikesController(service as unknown as LikesService);
  });

  it('delegates create with the expected arguments', () => {
    const result = controller.create({ postId: 'p1', username: 'bob' });
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'bob');
    expect(result).toBe(entity);
  });

  it('delegates findByPost with the expected arguments', () => {
    const result = controller.findByPost('p1');
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
    expect(result).toEqual([entity]);
  });

  it('delegates findOne with the expected arguments', () => {
    const result = controller.findOne('l1');
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('l1');
    expect(result).toBe(entity);
  });

  it('delegates remove with the expected arguments', () => {
    const result = controller.remove('l1');
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('l1');
    expect(result).toBe(undefined);
  });
});
