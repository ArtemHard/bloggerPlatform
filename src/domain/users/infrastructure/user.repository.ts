import { ObjectId, WithId } from "mongodb";
import { IUserDB } from "../types/user.db.interface";
import { usersCollection } from "../../../db/mongo.db";

export const usersRepository = {
  async create(user: IUserDB): Promise<WithId<IUserDB>> {
    const newUser = await usersCollection.insertOne({ ...user });

    return {...user, _id: newUser.insertedId };
  },
  async delete(id: string): Promise<boolean> {
    const isDel = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<IUserDB> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },
  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<WithId<IUserDB> | null> {
    return usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
};