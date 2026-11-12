import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { AuthorsRepository } from './authors.repository.js';
import { AuthorsService } from './authors.service.js';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let posts: PostsRepository;

  beforeEach(() => {
    posts = new PostsRepository();
    service = new AuthorsService(new AuthorsRepository(), posts);
  });

  it('creates and lists authors', () => {
    const author = service.create('Ada');

    expect(author.name).toBe('Ada');
    expect(service.findAll()).toEqual([author]);
  });

  it('finds an author by id', () => {
    const author = service.create('Ada');

    expect(service.findOne(author.id)).toEqual(author);
  });

  it('throws when author does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(NotFoundException);
  });

  it('updates an author', () => {
    const author = service.create('Ada');

    expect(service.update(author.id, 'Grace').name).toBe('Grace');
  });

  it('removes an author without posts', () => {
    const author = service.create('Ada');

    service.remove(author.id);

    expect(service.findAll()).toEqual([]);
  });

  it('refuses to remove an author who has posts', () => {
    const author = service.create('Ada');
    posts.save({ id: 'p1', authorId: author.id, title: 't', content: 'c' });

    expect(() => service.remove(author.id)).toThrow(ConflictException);
  });
});
