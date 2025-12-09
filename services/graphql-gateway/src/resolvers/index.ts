import { mergeResolvers } from '@graphql-tools/merge';
import { userResolvers } from './userResolvers';
import { sessionResolvers } from './sessionResolvers';
import { messageResolvers } from './messageResolvers';
import { queueResolvers } from './queueResolvers';
import { notificationResolvers } from './notificationResolvers';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';

// Scalar resolvers
const scalarResolvers = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
};

// Combine all resolvers
export const resolvers: any = mergeResolvers([
  scalarResolvers,
  userResolvers,
  sessionResolvers,
  messageResolvers,
  queueResolvers,
  notificationResolvers,
]);

export default resolvers;