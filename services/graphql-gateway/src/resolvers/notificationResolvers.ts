import { GraphQLContext } from '../types';
import { GraphQLError } from 'graphql';

export const notificationResolvers = {
  Query: {
    notifications: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { notificationService } = context.dataSources as any;
      return await notificationService.getNotifications(context.auth.user.id, limit, offset);
    },
    
    unreadNotifications: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { notificationService } = context.dataSources as any;
      return await notificationService.getUnreadNotifications(context.auth.user.id);
    },
  },
  
  Mutation: {
    markNotificationAsRead: async (_: any, { notificationId }: { notificationId: string }, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { notificationService } = context.dataSources as any;
      return await notificationService.markNotificationAsRead(notificationId);
    },
    
    markAllNotificationsAsRead: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.auth.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const { notificationService } = context.dataSources as any;
      return await notificationService.markAllNotificationsAsRead(context.auth.user.id);
    },
  },
  
  Notification: {
    user: async (notification: any, _: any, context: GraphQLContext) => {
      return await context.dataSources.userLoader.load(notification.userId);
    },
  },
};