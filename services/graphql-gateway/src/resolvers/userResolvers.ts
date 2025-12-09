import { GraphQLContext } from '../types';
import { GraphQLError } from 'graphql';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      return context.auth.user;
    },
    
    user: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      return await context.dataSources.userLoader.load(id);
    },
    
    users: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }, context: GraphQLContext) => {
      const { userService } = context.dataSources as any;
      return await userService.getUsers(limit, offset);
    },
    
    searchUsers: async (_: any, { query, limit = 20 }: { query: string; limit?: number }, context: GraphQLContext) => {
      const { userService } = context.dataSources as any;
      return await userService.searchUsers(query, limit);
    },
  },
  
  Mutation: {
    updateProfile: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { userService } = context.dataSources as any;
      return await userService.updateUser(context.auth.user.id, input);
    },
    
    updateProfileSettings: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { userService } = context.dataSources as any;
      return await userService.updateProfile(context.auth.user.id, input);
    },
    
    blockUser: async (_: any, { userId }: { userId: string }, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { userService } = context.dataSources as any;
      return await userService.blockUser(context.auth.user.id, userId);
    },
    
    reportUser: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { userService } = context.dataSources as any;
      const reportData = {
        ...input,
        reporterId: context.auth.user.id,
      };
      return await userService.reportUser(reportData);
    },
  },
  
  User: {
    profile: async (user: any, _: any, context: GraphQLContext) => {
      return await context.dataSources.profileLoader.load(user.id);
    },
    
    sessions: async (user: any, _: any, context: GraphQLContext) => {
      const { interactionService } = context.dataSources as any;
      return await interactionService.getUserSessions(user.id);
    },
    
    messages: async (user: any, _: any, context: GraphQLContext) => {
      const { communicationService } = context.dataSources as any;
      return await communicationService.getMessageHistory(user.id);
    },
    
    notifications: async (user: any, _: any, context: GraphQLContext) => {
      return await context.dataSources.notificationLoader.load(user.id);
    },
    
    connections: async (user: any, _: any, context: GraphQLContext) => {
      const { userService } = context.dataSources as any;
      return await userService.getConnections(user.id);
    },
  },
  
  UserProfile: {
    user: async (profile: any, _: any, context: GraphQLContext) => {
      return await context.dataSources.userLoader.load(profile.userId);
    },
  },
};