import { NotFoundException } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import type { CommentsService } from './comments.service.js';

describe('CommentsController', () => {
  const record = { id: 'c1', postId: 'p1', username: 'bob', text: 'Hello' };
  const makeService = () => ({
    create: vi.fn().mockReturnValue(record),
    findByPost: vi.fn().mockReturnValue([record]),
    findOne: vi.fn().mockReturnValue(record),
    update: vi.fn().mockReturnValue(record),
    remove: vi.fn(),
  });
  let service: ReturnType<typeof makeService>;
  let controller: CommentsController;

  beforeEach(() => {
    service = makeService();
    controller = new CommentsController(service as unknown as CommentsService);
  });

  it('creates via the service', () => {
    expect(
      controller.create({ postId: 'p1', username: 'bob', text: 'Hello' }),
    ).toBe(record);
    expect(service.create).toHaveBeenCalledExactlyOnceWith(
      'p1',
      'bob',
      'Hello',
    );
  });

  it('lists via the service', () => {
    expect(controller.findByPost('p1')).toEqual([record]);
    expect(service.findByPost).toHaveBeenCalledExactlyOnceWith('p1');
  });

  it('finds by id via the service', () => {
    expect(controller.findOne(record.id)).toBe(record);
    expect(service.findOne).toHaveBeenCalledExactlyOnceWith(record.id);
  });

  it('updates via the service', () => {
    expect(controller.update(record.id, { text: 'Updated' })).toBe(record);
    expect(service.update).toHaveBeenCalledExactlyOnceWith(
      record.id,
      'Updated',
    );
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
