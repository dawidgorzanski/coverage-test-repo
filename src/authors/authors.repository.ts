import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../shared/in-memory.repository.js';
import type { Author } from './author.js';

@Injectable()
export class AuthorsRepository extends InMemoryRepository<Author> {}
