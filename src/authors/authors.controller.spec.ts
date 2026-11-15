import { ConflictException, NotFoundException } from '@nestjs/common';
import type { AuthorsService } from './authors.service.js';
import { AuthorsController } from './authors.controller.js';

describe('AuthorsController', () => {
  it('creates an author via the service', () => {
    const author = { id: 'a1', name: 'Ada' };
    const service = { create: vi.fn().mockReturnValue(author) } as unknown as AuthorsService;

    expect(new AuthorsController(service).create({ name: 'Ada' })).toBe(author);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
  });

  it('lists authors via the service', () => {
    const authors = [{ id: 'a1', name: 'Ada' }];
    const service = { findAll: vi.fn().mockReturnValue(authors) } as unknown as AuthorsService;

    expect(new AuthorsController(service).findAll()).toBe(authors);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('finds an author by id via the service', () => {
    const author = { id: 'a1', name: 'Ada' };
    const service = { findOne: vi.fn().mockReturnValue(author) } as unknown as AuthorsService;

    expect(new AuthorsController(service).findOne('a1')).toBe(author);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('a1');
  });

  it('updates an author via the service', () => {
    const author = { id: 'a1', name: 'Grace' };
    const service = { update: vi.fn().mockReturnValue(author) } as unknown as AuthorsService;

    expect(new AuthorsController(service).update('a1', { name: 'Grace' })).toBe(author);
    expect(service.update).toHaveBeenCalledExactlyOnceWith('a1', 'Grace');
  });

  it('removes an author via the service', () => {
    const service = { remove: vi.fn() } as unknown as AuthorsService;

    expect(new AuthorsController(service).remove('a1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('a1');
  });

  it('propagates a missing author error from the service', () => {
    const error = new NotFoundException('Author missing not found');
    const service = {
      findOne: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as AuthorsService;

    expect(() => new AuthorsController(service).findOne('missing')).toThrow(error);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('missing');
  });

  it('propagates a conflict when removing an author with posts', () => {
    const error = new ConflictException('Author still has posts');
    const service = {
      remove: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as AuthorsService;

    expect(() => new AuthorsController(service).remove('a1')).toThrow(error);
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('a1');
  });
});
