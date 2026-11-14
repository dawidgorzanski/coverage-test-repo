import { NotFoundException } from '@nestjs/common';
import { AuthorsController } from './authors.controller.js';
import type { AuthorsService } from './authors.service.js';

describe('AuthorsController', () => {
  const record = { id: 'a1', name: 'Ada' };
  const makeService = () => ({
    create: vi.fn().mockReturnValue(record),
    findAll: vi.fn().mockReturnValue([record]),
    findOne: vi.fn().mockReturnValue(record),
    update: vi.fn().mockReturnValue(record),
    remove: vi.fn(),
  });
  let service: ReturnType<typeof makeService>;
  let controller: AuthorsController;

  beforeEach(() => {
    service = makeService();
    controller = new AuthorsController(service as unknown as AuthorsService);
  });

  it('creates via the service', () => {
    expect(controller.create({ name: 'Ada' })).toBe(record);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('Ada');
  });

  it('lists via the service', () => {
    expect(controller.findAll()).toEqual([record]);
    expect(service.findAll).toHaveBeenCalledExactlyOnceWith();
  });

  it('finds by id via the service', () => {
    expect(controller.findOne(record.id)).toBe(record);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith(record.id);
  });

  it('updates via the service', () => {
    expect(controller.update(record.id, { name: 'Grace' })).toBe(record);
    expect(service.update).toHaveBeenCalledExactlyOnceWith(record.id, 'Grace');
  });

  it('removes via the service', () => {
    expect(controller.remove(record.id)).toBeUndefined();
    expect(service.remove).toHaveBeenCalledExactlyOnceWith(record.id);
  });

  it('propagates service errors', () => {
    const error = new NotFoundException('Missing record');
    service.findOne.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.findOne('missing')).toThrow(error);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith('missing');
  });
});
