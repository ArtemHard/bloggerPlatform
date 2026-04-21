import {body} from "express-validator";
import { container } from "../../ioc/ioc.container";
import { TYPES } from "../../ioc/ioc.types";
import { IUsersRepository } from "../../domain/repositories/types/users.repository.interface";

export const emailValidation = body("email")
    .isString()
    .trim()
    .isLength({min: 1})
    .isEmail()
    .withMessage("email is not correct")
    .custom(
        async (email: string) => {
            const usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository);
            const user = await usersRepository.findByLoginOrEmail(email);
            if (user) {
                throw new Error("email already exist");
            }
            return true;
        });