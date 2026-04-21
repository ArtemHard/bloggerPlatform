export const TYPES = {
  // Repositories
  BlogsRepository: Symbol.for('BlogsRepository'),
  CommentsRepository: Symbol.for('CommentsRepository'),
  PostsRepository: Symbol.for('PostsRepository'),
  RequestLogsRepository: Symbol.for('RequestLogsRepository'),
  UsersRepository: Symbol.for('UsersRepository'),
  TokensRepository: Symbol.for('TokensRepository'),
  SecurityQueryRepository: Symbol.for('SecurityQueryRepository'),
  UsersQueryRepository: Symbol.for('UsersQueryRepository'),
  CommentsQueryRepository: Symbol.for('CommentsQueryRepository'),

  // Services
  BlogService: Symbol.for('BlogService'),
  PostsService: Symbol.for('PostsService'),
  CommentsService: Symbol.for('CommentsService'),
  UsersService: Symbol.for('UsersService'),
  AuthService: Symbol.for('AuthService'),
  SecurityService: Symbol.for('SecurityService'),
};
