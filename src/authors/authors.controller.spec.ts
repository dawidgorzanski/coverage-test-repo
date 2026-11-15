import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthorsController } from './authors.controller.js';
import type { AuthorsService } from './authors.service.js';

describe('AuthorsController', () => {
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

  it('creates an author via the service', () => {
    const author = { id: 'a1', name: 'Ada' };
    service.create.mockReturnValue(author);

    expect(controller.create({ name: 'Ada' })).toBe(author);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
  });

  it('lists authors via the service', () => {
    const authors = [{ id: 'a1', name: 'Ada' }];
    service.findAll.mockReturnValue(authors);

    expect(controller.findAll()).toBe(authors);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('returns an empty list when there are no authors', () => {
    service.findAll.mockReturnValue([]);

    expect(controller.findAll()).toEqual([]);
  });

  it('finds an author by id via the service', () => {
    const author = { id: 'a1', name: 'Ada' };
    service.findOne.mockReturnValue(author);

    expect(controller.findOne('a1')).toBe(author);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('a1');
  });

  it('updates an author via the service', () => {
    const author = { id: 'a1', name: 'Grace' };
    service.update.mockReturnValue(author);

    expect(controller.update('a1', { name: 'Grace' })).toBe(author);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('a1', 'Grace');
  });

  it('removes an author via the service without returning a body', () => {
    expect(controller.remove('a1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('a1');
  });

  it('propagates the service error when an author is missing', () => {
    const error = new NotFoundException('Author missing not found');
    service.findOne.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.findOne('missing')).toThrow(error);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('missing');
  });

  it('propagates the service error when an author still has posts', () => {
    const error = new ConflictException('Author still has posts');
    service.remove.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.remove('a1')).toThrow(error);
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('a1');
  });
});
