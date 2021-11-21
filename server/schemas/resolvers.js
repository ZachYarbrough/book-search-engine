const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // returns all user info necessary for dashboard page
    me: async (parent, args, context) => {
      if (context.user) {
        // the current user that is logged
        const user = await User.findOne({ _id: context.user._id })
          .select('-__v -password')

        return user;
      }

      throw new AuthenticationError('Not logged in');
    }
  },
  Mutation: {
    // logs a user in if email and password are valid
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // uses helper function to verify password is correct
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    // adds a new user to the database
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, args) => {
        const book = await Book.create(args);

        return book;
    }
  }
};

module.exports = resolvers;
