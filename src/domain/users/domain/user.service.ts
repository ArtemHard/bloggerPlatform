import { inject, injectable } from 'inversify';
import { IUserDB } from '../types/user.db.interface';
import { CreateUserDto } from '../types/create-user.dto';
import { bcryptService } from '../../../auth/adapters/bcrypt.service';
import { TYPES } from '../../../ioc/ioc.types';
import { IUsersRepository } from '../../repositories/types/users.repository.interface';
import { ValidationError } from '../../../core/errors/errors.handler';
import { UserModel } from './user.schema';
import { UserDocument } from './user.schema';

@injectable()
export class UsersService {
  @inject(TYPES.UsersRepository) private usersRepository!: IUsersRepository;

  constructor() {}

  async create(
    dto: CreateUserDto,
  ): Promise<Omit<IUserDB, 'passwordHash'> & { _id: string }> {
    const { login, password, email } = dto;
    const passwordHash = await bcryptService.generateHash(password);

    const newUser = UserModel.createUser(login, email, passwordHash);

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

    const createdUser = await this.usersRepository.create(newUser);

    // Return user without password hash but with _id as string
    const { passwordHash: passwordHashFromDb, __v, ...userWithoutPassword } = createdUser.toObject();
    return {
      ...userWithoutPassword,
      _id: createdUser._id.toString()
    };
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepository.findById(id);
    if (!user) return false;

    return await this.usersRepository.delete(id);
  }
}
