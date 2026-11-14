import type { CommentsService } from './comments.service.js';
import { CommentsController } from './comments.controller.js';

describe('CommentsController delegation', () => {
  const entity = { id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' };
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
      create: vi.fn().mockReturnValue(entity),
      findByPost: vi.fn().mockReturnValue([entity]),
      findOne: vi.fn().mockReturnValue(entity),
      update: vi.fn().mockReturnValue(entity),
      remove: vi.fn().mockReturnValue(undefined),
    };
    controller = new CommentsController(service as unknown as CommentsService);
  });

  it('delegates create with the expected arguments', () => {
    const result = controller.create({
      postId: 'p1',
      username: 'bob',
      text: 'Hello',
    });
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'bob',
      'Hello',
    );
    expect(result).toBe(entity);
  });

  it('delegates findByPost with the expected arguments', () => {
    const result = controller.findByPost('p1');
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
    expect(result).toEqual([entity]);
  });

  it('delegates findOne with the expected arguments', () => {
    const result = controller.findOne('c1');
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('c1');
    expect(result).toBe(entity);
  });

  it('delegates update with the expected arguments', () => {
    const result = controller.update('c1', { text: 'Updated' });
    expect(service.update).toHaveBeenCalledExactlyOnceWith('c1', 'Updated');
    expect(result).toBe(entity);
  });

  it('delegates remove with the expected arguments', () => {
    const result = controller.remove('c1');
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('c1');
    expect(result).toBe(undefined);
  });
});
