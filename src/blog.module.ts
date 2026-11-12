/* v8 ignore file -- @preserve */
// Pure wiring, nothing worth unit testing: excluded from coverage.
import { Module } from '@nestjs/common';
import { AuthorsController } from './authors/authors.controller.js';
import { AuthorsRepository } from './authors/authors.repository.js';
import { AuthorsService } from './authors/authors.service.js';
import { CommentsController } from './comments/comments.controller.js';
import { CommentsRepository } from './comments/comments.repository.js';
import { CommentsService } from './comments/comments.service.js';
import { LikesController } from './likes/likes.controller.js';
import { LikesRepository } from './likes/likes.repository.js';
import { LikesService } from './likes/likes.service.js';
import { PostsController } from './posts/posts.controller.js';
import { PostsRepository } from './posts/posts.repository.js';
import { PostsService } from './posts/posts.service.js';

@Module({
  controllers: [AuthorsController, PostsController, CommentsController, LikesController],
  providers: [
    AuthorsRepository,
    PostsRepository,
    CommentsRepository,
    LikesRepository,
    AuthorsService,
    PostsService,
    CommentsService,
    LikesService,
  ],
})
export class BlogModule {}
