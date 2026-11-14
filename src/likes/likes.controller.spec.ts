import { NotFoundException } from '@nestjs/common';
import { LikesController } from './likes.controller.js';
import type { LikesService } from './likes.service.js';

describe('LikesController', () => {
  const record = { id: 'l1', postId: 'p1', username: 'bob' };
  const makeService = () => ({
    create: vi.fn().mockReturnValue(record),
    findByPost: vi.fn().mockReturnValue([record]),
    findOne: vi.fn().mockReturnValue(record),

    remove: vi.fn(),
  });
  let service: ReturnType<typeof makeService>;
  let controller: LikesController;

  beforeEach(() => {
    service = makeService();
    controller = new LikesController(service as unknown as LikesService);
  });

  it('creates via the service', () => {
    expect(controller.create({ postId: 'p1', username: 'bob' })).toBe(record);
    expect(service.create).toHaveBeenCalledExactlyOnceWith('p1', 'bob');
  });

  it('lists via the service', () => {
    expect(controller.findByPost('p1')).toEqual([record]);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('finds by id via the service', () => {
    expect(controller.findOne(record.id)).toBe(record);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith(record.id);
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
