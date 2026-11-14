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
  const item = { id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' };
  let controller: PostsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn().mockReturnValue(item),
      findAll: vi.fn().mockReturnValue([item]),
      findOne: vi.fn().mockReturnValue(item),
      update: vi.fn().mockReturnValue(item),
      remove: vi.fn(),
    };
    controller = new PostsController(service as unknown as PostsService);
  });

  it('creates through the service with the body fields', () => {
    expect(
      controller.create({ authorId: 'a1', title: 'Title', content: 'Body' }),
    ).toBe(item);
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'a1',
      'Title',
      'Body',
    );
  });

  it('lists through the service', () => {
    expect(controller.findAll()).toEqual([item]);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('finds by id through the service', () => {
    expect(controller.findOne(item.id)).toBe(item);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith(item.id);
  });

  it('updates through the service with the id and body fields', () => {
    expect(controller.update(item.id, { title: 'New', content: 'Text' })).toBe(
      item,
    );
    expect(service.update).toHaveBeenCalledExactlyOnceWith(
      item.id,
      'New',
      'Text',
    );
  });

  it('removes by id through the service', () => {
    expect(controller.remove(item.id)).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith(item.id);
  });
});
