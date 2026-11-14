import type { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

describe('CommentsController delegation', () => {
  const item = { id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' };
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
      create: vi.fn().mockReturnValue(item),
      findByPost: vi.fn().mockReturnValue([item]),
      findOne: vi.fn().mockReturnValue(item),
      update: vi.fn().mockReturnValue(item),
      remove: vi.fn(),
    };
    controller = new CommentsController(service as unknown as CommentsService);
  });

  it('creates through the service with the body fields', () => {
    expect(
      controller.create({ postId: 'p1', username: 'bob', text: 'Hello' }),
    ).toBe(item);
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'bob',
      'Hello',
    );
  });

  it('lists through the service', () => {
    expect(controller.findByPost('p1')).toEqual([item]);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('finds by id through the service', () => {
    expect(controller.findOne(item.id)).toBe(item);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith(item.id);
  });

  it('updates through the service with the id and body fields', () => {
    expect(controller.update(item.id, { text: 'Updated' })).toBe(item);
    expect(service.update).toHaveBeenCalledExactlyOnceWith(item.id, 'Updated');
  });

  it('removes by id through the service', () => {
    expect(controller.remove(item.id)).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith(item.id);
  });
});
