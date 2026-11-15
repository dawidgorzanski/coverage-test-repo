import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository.js';
import { LikesRepository } from './likes.repository.js';
import { LikesService } from './likes.service.js';

describe('LikesService', () => {
  let service: LikesService;
  let likes: LikesRepository;
  let posts: PostsRepository;

  beforeEach(() => {
    likes = new LikesRepository();
    posts = new PostsRepository();
    posts.save({ id: 'p1', authorId: 'a1', title: 'Title', content: 'Body' });
    posts.save({ id: 'p2', authorId: 'a1', title: 'Other', content: 'Body' });
    service = new LikesService(likes, posts);
  });

  it('refuses to like an unknown post', () => {
    const service = new LikesService(new LikesRepository(), new PostsRepository());

    expect(() => service.create('missing', 'bob')).toThrow(NotFoundException);
  });

  it('creates and persists a like for an existing post', () => {
    const like = service.create('p1', 'bob');

    expect(like).toEqual({
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
      postId: 'p1',
      username: 'bob',
    });
    expect(likes.findById(like.id)).toEqual(like);
  });

  it('refuses a duplicate like without saving another like', () => {
    const like = service.create('p1', 'bob');

    expect(() => service.create('p1', 'bob')).toThrow(
      new ConflictException('Post already liked by user'),
    );
    expect(likes.findAll()).toEqual([like]);
  });

  it('allows different users to like the same post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p1', 'alice');

    expect(second.id).not.toBe(first.id);
    expect(likes.findByPost('p1')).toEqual([first, second]);
  });

  it('allows the same user to like different posts', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p2', 'bob');

    expect(likes.findAll()).toEqual([first, second]);
  });

  it('returns only the likes for the requested post', () => {
    const first = service.create('p1', 'bob');
    const second = service.create('p1', 'alice');
    service.create('p2', 'bob');

    expect(service.findByPost('p1')).toEqual([first, second]);
  });

  it('returns an empty array when the post has no likes', () => {
    expect(service.findByPost('p1')).toEqual([]);
  });

  it('finds a like by id', () => {
    const like = service.create('p1', 'bob');

    expect(service.findOne(like.id)).toEqual(like);
  });

  it('throws when the like does not exist', () => {
    expect(() => service.findOne('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
  });

  it('removes a like and preserves other likes', () => {
    const removed = service.create('p1', 'bob');
    const retained = service.create('p1', 'alice');

    service.remove(removed.id);

    expect(likes.findById(removed.id)).toBeUndefined();
    expect(likes.findAll()).toEqual([retained]);
  });

  it('throws without deleting anything when removing an unknown like', () => {
    const like = service.create('p1', 'bob');
    const deleteSpy = vi.spyOn(likes, 'delete');

    expect(() => service.remove('missing')).toThrow(
      new NotFoundException('Like missing not found'),
    );
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(likes.findAll()).toEqual([like]);
  });
});
