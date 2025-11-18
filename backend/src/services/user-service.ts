import { AppDataSource } from '../data-source';
import { User } from '../entities/postgres/User';

const userRepository = AppDataSource.getRepository(User);

export const UserService = {
  createUser: async (username: string) => {
    const user = userRepository.create({ name: username });
    return userRepository.save(user);
  },

  incrementUserTotalGames: async (username: string) => {
    const user = await userRepository.findOne({ where: { name: username } });

    if (!user) {
      throw Error(
        `Could not find username (${username}) to increment total games played`
      );
    }

    if (!user.totalGames) {
      user.totalGames = 1;
    } else {
      user.totalGames = user.totalGames + 1;
    }

    return userRepository.save(user);
  },

  incrementUserTotalWins: async (username: string) => {
    const user = await userRepository.findOne({ where: { name: username } });

    if (!user) {
      throw Error(
        `Could not find username (${username}) to increment total wins`
      );
    }

    if (!user.totalWins) {
      user.totalWins = 1;
    } else {
      user.totalWins = user.totalWins + 1;
    }

    return userRepository.save(user);
  },
};
