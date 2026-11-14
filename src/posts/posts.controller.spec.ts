import type { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';

describe('PostsController', () => {
  it('lists posts via the service', () => {
    const service = {
      findAll: vi.fn().mockReturnValue([]),
    } as unknown as PostsService;

    expect(new PostsController(service).findAll()).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });
});

describe('PostsController delegation', () => {
  const entity = { id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' };
  let controller: PostsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  beforeEach(() => {
    service = {
      create: vi.fn().mockReturnValue(entity),
      findOne: vi.fn().mockReturnValue(entity),
      update: vi.fn().mockReturnValue(entity),
      remove: vi.fn().mockReturnValue(undefined),
    };
    controller = new PostsController(service as unknown as PostsService);
  });

  it('delegates create with the expected arguments', () => {
    const result = controller.create({
      authorId: 'a1',
      title: 'Title',
      content: 'Body',
    });
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'a1',
      'Title',
      'Body',
    );
    expect(result).toBe(entity);
  });

  it('delegates findOne with the expected arguments', () => {
    const result = controller.findOne('p1');
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('p1');
    expect(result).toBe(entity);
  });

  it('delegates update with the expected arguments', () => {
    const result = controller.update('p1', {
      title: 'New',
      content: 'Updated',
    });
    expect(service.update).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'New',
      'Updated',
    );
    expect(result).toBe(entity);
  });

  it('delegates remove with the expected arguments', () => {
    const result = controller.remove('p1');
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('p1');
    expect(result).toBe(undefined);
  });
});
