import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthorsRepository } from '../authors/authors.repository.js';
import { CommentsRepository } from '../comments/comments.repository.js';
import { LikesRepository } from '../likes/likes.repository.js';
import { PostsRepository } from './posts.repository.js';
import { PostsService } from './posts.service.js';

describe('PostsService', () => {
  let service: PostsService;
  let comments: CommentsRepository;
  let likes: LikesRepository;

  beforeEach(() => {
    const authors = new AuthorsRepository();
    authors.save({ id: 'a1', name: 'Ada' });
    comments = new CommentsRepository();
    likes = new LikesRepository();
    service = new PostsService(new PostsRepository(), authors, comments, likes);
  });

  it('creates a post for an existing author', () => {
    const post = service.create('a1', 'Title', 'Body');

    expect(post).toMatchObject({ authorId: 'a1', title: 'Title', content: 'Body' });
    expect(service.findAll()).toEqual([post]);
  });

  it('refuses to create a post for an unknown author', () => {
    expect(() => service.create('nope', 'Title', 'Body')).toThrow(NotFoundException);
  });

  it('finds a post by id', () => {
    const post = service.create('a1', 'Title', 'Body');

    expect(service.findOne(post.id)).toEqual(post);
  });

  it('throws when post does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(NotFoundException);
  });

  it('updates a post', () => {
    const post = service.create('a1', 'Title', 'Body');

    expect(service.update(post.id, 'New', 'Text')).toMatchObject({
      title: 'New',
      content: 'Text',
    });
  });

  it('removes a post without comments or likes', () => {
    const post = service.create('a1', 'Title', 'Body');

    service.remove(post.id);

    expect(service.findAll()).toEqual([]);
  });

  it('refuses to remove a post that has comments', () => {
    const post = service.create('a1', 'Title', 'Body');
    comments.save({ id: 'c1', postId: post.id, username: 'bob', text: 'hi' });

    expect(() => service.remove(post.id)).toThrow(ConflictException);
  });

  it('refuses to remove a post that has likes', () => {
    const post = service.create('a1', 'Title', 'Body');
    likes.save({ id: 'l1', postId: post.id, username: 'bob' });

    expect(() => service.remove(post.id)).toThrow(ConflictException);
  });
});
