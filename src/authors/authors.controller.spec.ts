import type { AuthorsService } from './authors.service.js';
import { AuthorsController } from './authors.controller.js';

describe('AuthorsController delegation', () => {
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
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    controller = new AuthorsController(service as unknown as AuthorsService);
  });

  it('delegates create and returns the service result', () => {
    const result = { id: 'a1', name: 'Ada' };
    service.create.mockReturnValue(result);

    expect(controller.create({ name: 'Ada' })).toBe(result);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
  });

  it('delegates findAll and returns the service result', () => {
    const result = [{ id: 'a1', name: 'Ada' }];
    service.findAll.mockReturnValue(result);

    expect(controller.findAll()).toBe(result);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('delegates findOne and returns the service result', () => {
    const result = { id: 'a1', name: 'Ada' };
    service.findOne.mockReturnValue(result);

    expect(controller.findOne('a1')).toBe(result);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('a1');
  });

  it('delegates update and returns the service result', () => {
    const result = { id: 'a1', name: 'Grace' };
    service.update.mockReturnValue(result);

    expect(controller.update('a1', { name: 'Grace' })).toBe(result);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('a1', 'Grace');
  });

  it('delegates removal and returns no value', () => {
    expect(controller.remove('a1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('a1');
  });
});
