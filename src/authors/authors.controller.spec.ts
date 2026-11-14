import type { AuthorsService } from './authors.service.js';
import { AuthorsController } from './authors.controller.js';

describe('AuthorsController delegation', () => {
  const entity = { id: 'a1', name: 'Ada' };
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
      create: vi.fn().mockReturnValue(entity),
      findAll: vi.fn().mockReturnValue([entity]),
      findOne: vi.fn().mockReturnValue(entity),
      update: vi.fn().mockReturnValue(entity),
      remove: vi.fn().mockReturnValue(undefined),
    };
    controller = new AuthorsController(service as unknown as AuthorsService);
  });

  it('delegates create with the expected arguments', () => {
    const result = controller.create({ name: 'Ada' });
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
    expect(result).toBe(entity);
  });

  it('delegates findAll with the expected arguments', () => {
    const result = controller.findAll();
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
    expect(result).toEqual([entity]);
  });

  it('delegates findOne with the expected arguments', () => {
    const result = controller.findOne('a1');
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('a1');
    expect(result).toBe(entity);
  });

  it('delegates update with the expected arguments', () => {
    const result = controller.update('a1', { name: 'Grace' });
    expect(service.update).toHaveBeenCalledExactlyOnceWith('a1', 'Grace');
    expect(result).toBe(entity);
  });

  it('delegates remove with the expected arguments', () => {
    const result = controller.remove('a1');
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('a1');
    expect(result).toBe(undefined);
  });
});
