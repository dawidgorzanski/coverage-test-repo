import { NotFoundException } from '@nestjs/common';
import type { AuthorsService } from './authors.service.js';
import { AuthorsController } from './authors.controller.js';

describe('AuthorsController', () => {
  it('creates via the service', () => {
    const record = { id: '1', name: 'Ada' };
    const service = {
      create: vi.fn().mockReturnValue(record),
    } as unknown as AuthorsService;
    expect(new AuthorsController(service).create({ name: 'Ada' })).toBe(record);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
  });
  it('lists via the service', () => {
    const records = [{ id: '1', name: 'Ada' }];
    const service = {
      findAll: vi.fn().mockReturnValue(records),
    } as unknown as AuthorsService;
    expect(new AuthorsController(service).findAll()).toBe(records);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });
  it('finds a record by id via the service', () => {
    const record = { id: '1', name: 'Ada' };
    const service = {
      findOne: vi.fn().mockReturnValue(record),
    } as unknown as AuthorsService;
    expect(new AuthorsController(service).findOne('1')).toBe(record);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('1');
  });
  it('removes via the service', () => {
    const service = { remove: vi.fn() } as unknown as AuthorsService;
    expect(new AuthorsController(service).remove('1')).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith('1');
  });
  it('propagates a service error', () => {
    const error = new NotFoundException('Missing record');
    const service = {
      findOne: vi.fn().mockImplementation(() => {
        throw error;
      }),
    } as unknown as AuthorsService;
    expect(() => new AuthorsController(service).findOne('missing')).toThrow(
      error,
    );
  });
  it('updates via the service', () => {
    const record = { ...{ id: '1', name: 'Ada' }, ...{ name: 'Grace' } };
    const service = {
      update: vi.fn().mockReturnValue(record),
    } as unknown as AuthorsService;
    expect(new AuthorsController(service).update('1', { name: 'Grace' })).toBe(
      record,
    );
    expect(service.update).toHaveBeenCalledExactlyOnceWith('1', 'Grace');
  });
});
