import type { AuthorsService } from './authors.service.js';
import { AuthorsController } from './authors.controller.js';

describe('AuthorsController delegation', () => {
  const item = { id: 'a1', name: 'Ada' };
  let controller: AuthorsController;
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
    controller = new AuthorsController(service as unknown as AuthorsService);
  });

  it('creates through the service with the body fields', () => {
    expect(controller.create({ name: 'Ada' })).toBe(item);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
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
    expect(controller.update(item.id, { name: 'Grace' })).toBe(item);
    expect(service.update).toHaveBeenCalledExactlyOnceWith(item.id, 'Grace');
  });

  it('removes by id through the service', () => {
    expect(controller.remove(item.id)).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith(item.id);
  });
});
