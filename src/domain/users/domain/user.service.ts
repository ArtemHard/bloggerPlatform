import { inject, injectable } from 'inversify';
import { IUserDB } from '../types/user.db.interface';
import { CreateUserDto } from '../types/create-user.dto';
import { WithId } from 'mongodb';
import { bcryptService } from '../../../auth/adapters/bcrypt.service';
import { TYPES } from '../../../ioc/ioc.types';
import { IUsersRepository } from '../../repositories/types/users.repository.interface';
import { ValidationError } from '../../../core/errors/errors.handler';
import { User } from './user.entity';

@injectable()
export class UsersService {
  @inject(TYPES.UsersRepository) private usersRepository!: IUsersRepository;

  constructor() {}

  async create(
    dto: CreateUserDto,
  ): Promise<WithId<Omit<IUserDB, 'passwordHash'>>> {
    const { login, password, email } = dto;
    const passwordHash = await bcryptService.generateHash(password);

    const newUser: IUserDB = new User(login, email, passwordHash);

    const existingUser =
      (await this.usersRepository.findByLoginOrEmail(newUser.email)) ||
      (await this.usersRepository.findByLoginOrEmail(newUser.login));

    if (existingUser) {
      const field = newUser.email === existingUser.email ? 'email' : 'login';
      throw new ValidationError([
        {
          field,
          message: `${field} should be unique`,
        },
      ]);
    }

    const { passwordHash: passwordHashFromDb, ...newUserFromDB } =
      await this.usersRepository.create(newUser);

    return newUserFromDB;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepository.findById(id);
    if (!user) return false;

    return await this.usersRepository.delete(id);
  }
}
