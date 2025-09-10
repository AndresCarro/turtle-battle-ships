import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export const UserService = {
  createUser: async (username: string) => {
    const user = userRepository.create({ name: username });
    return userRepository.save(user);
  },
};
