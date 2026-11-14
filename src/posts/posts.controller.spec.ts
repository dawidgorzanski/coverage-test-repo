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
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    controller = new PostsController(service as unknown as PostsService);
  });

  it('delegates create and returns the service result', () => {
    const result = {
      id: 'p1',
      authorId: 'a1',
      title: 'Title',
      content: 'Body',
    };
    service.create.mockReturnValue(result);

    expect(
      controller.create({ authorId: 'a1', title: 'Title', content: 'Body' }),
    ).toBe(result);
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'a1',
      'Title',
      'Body',
    );
  });

  it('delegates findAll and returns the service result', () => {
    const result = [
      { id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' },
    ];
    service.findAll.mockReturnValue(result);

    expect(controller.findAll()).toBe(result);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('delegates findOne and returns the service result', () => {
    const result = {
      id: 'p1',
      authorId: 'a1',
      title: 'Title',
      content: 'Body',
    };
    service.findOne.mockReturnValue(result);

    expect(controller.findOne('p1')).toBe(result);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('delegates update and returns the service result', () => {
    const result = {
      id: 'p1',
      authorId: 'a1',
      title: 'Updated',
      content: 'New body',
    };
    service.update.mockReturnValue(result);

    expect(
      controller.update('p1', { title: 'Updated', content: 'New body' }),
    ).toBe(result);
    expect(service.update).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'Updated',
      'New body',
    );
  });

  it('delegates removal and returns no value', () => {
    expect(controller.remove('p1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('p1');
  });
});
