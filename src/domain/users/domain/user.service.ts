import { IUserDB } from "../types/user.db.interface";
import { CreateUserDto } from "../types/create-user.dto";
import { WithId } from "mongodb";
import { bcryptService } from "../../../auth/adapters/bcrypt.service";
import { usersRepository } from "../infrastructure/user.repository";
import { ValidationError } from "../../../core/errors/errors.handler";

export const usersService = {
  async create(dto: CreateUserDto): Promise<WithId<Omit<IUserDB, 'passwordHash'>>> {
    const { login, password, email } = dto;
    const passwordHash = await bcryptService.generateHash(password);

    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    };

 const existingUser = await usersRepository.findByLoginOrEmail(newUser.email) ||
                         await usersRepository.findByLoginOrEmail(newUser.login);

  if (existingUser) {
      const field = newUser.email === existingUser.email ? 'email' : 'login';
      throw new ValidationError([{
        field,
        message: `${field} should be unique`
      }]);
    }
    
    const {passwordHash: passwordHashFromDb, ...newUserFromDB} = await usersRepository.create(newUser);

    return newUserFromDB;
  },

  async delete(id: string): Promise<boolean> {
    const user = await usersRepository.findById(id);
    if (!user) return false;

    return await usersRepository.delete(id);
  },
};