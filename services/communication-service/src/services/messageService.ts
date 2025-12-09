import { PrismaClient } from '@prisma/client';
import { RedisService } from './redisService';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { MessageData } from '../types';

export class MessageService {
  constructor(
    private prisma: PrismaClient,
    private redisService: RedisService
  ) {}

  async sendMessage(messageData: MessageData): Promise<any> {
    try {
      // Save message to database
      const message = await this.prisma.message.create({
        data: {
          messageId: messageData.messageId,
          roomId: messageData.roomId,
          senderId: messageData.senderId,
          content: messageData.content,
          messageType: messageData.messageType,
          voiceUrl: messageData.voiceUrl,
          voiceDuration: messageData.voiceDuration,
          imageUrl: messageData.imageUrl,
          replyToId: messageData.replyToId,
          timestamp: messageData.timestamp
        }
      });

      // Cache message in Redis for quick retrieval
      await this.redisService.cacheMessage(messageData.roomId, message);

      // Update room last activity
      await this.prisma.chatRoom.update({
        where: { roomId: messageData.roomId },
        data: { lastActivity: new Date() }
      });

      logger.info('Message sent', {
        messageId: message.messageId,
        roomId: message.roomId,
        senderId: message.senderId,
        type: message.messageType
      });

      return message;
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(roomId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Try to get from cache first
      if (offset === 0 && this.redisService.isHealthy()) {
        const cachedMessages = await this.redisService.getCachedMessages(roomId, limit);
        if (cachedMessages.length > 0) {
          return cachedMessages;
        }
      }

      // Fallback to database
      const messages = await this.prisma.message.findMany({
        where: {
          roomId,
          isDeleted: false
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          replyTo: {
            select: {
              messageId: true,
              content: true,
              senderId: true,
              messageType: true
            }
          },
          reactions: {
            select: {
              userId: true,
              emoji: true
            }
          }
        }
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      logger.error('Failed to get messages:', error);
      throw error;
    }
  }

  async markMessageAsDelivered(messageId: string, userId: string): Promise<void> {
    try {
      await this.prisma.messageDelivery.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId
          }
        },
        update: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        },
        create: {
          messageId,
          userId,
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });

      await this.prisma.message.update({
        where: { messageId },
        data: {
          isDelivered: true,
          deliveredAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to mark message as delivered:', error);
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      await this.prisma.messageDelivery.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId
          }
        },
        update: {
          status: 'READ',
          readAt: new Date()
        },
        create: {
          messageId,
          userId,
          status: 'READ',
          readAt: new Date()
        }
      });

      await this.prisma.message.update({
        where: { messageId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to mark message as read:', error);
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { messageId }
      });

      if (!message || message.senderId !== userId) {
        return false;
      }

      await this.prisma.message.update({
        where: { messageId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          content: '[Message deleted]'
        }
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete message:', error);
      return false;
    }
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<boolean> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { messageId }
      });

      if (!message || message.senderId !== userId || message.messageType !== 'TEXT') {
        return false;
      }

      await this.prisma.message.update({
        where: { messageId },
        data: {
          content: newContent,
          isEdited: true,
          editedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      logger.error('Failed to edit message:', error);
      return false;
    }
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    try {
      await this.prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji
        }
      });

      return true;
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Reaction already exists, remove it instead
        await this.prisma.messageReaction.delete({
          where: {
            messageId_userId_emoji: {
              messageId,
              userId,
              emoji
            }
          }
        });
        return false;
      }
      logger.error('Failed to add reaction:', error);
      return false;
    }
  }

  async createOrGetRoom(participant1Id: string, participant2Id?: string): Promise<string> {
    try {
      let room;

      if (participant2Id) {
        // Private room between two users
        room = await this.prisma.chatRoom.findFirst({
          where: {
            OR: [
              {
                participant1Id,
                participant2Id
              },
              {
                participant1Id: participant2Id,
                participant2Id: participant1Id
              }
            ],
            type: 'PRIVATE'
          }
        });
      }

      if (!room) {
        // Create new room
        room = await this.prisma.chatRoom.create({
          data: {
            roomId: this.generateRoomId(),
            type: participant2Id ? 'PRIVATE' : 'TEMPORARY',
            participant1Id,
            participant2Id,
            isActive: true
          }
        });

        // Add participants to room
        await this.prisma.userRoom.createMany({
          data: [
            {
              userId: participant1Id,
              roomId: room.roomId,
              role: 'MEMBER' as any
            },
            ...(participant2Id ? [{
              userId: participant2Id,
              roomId: room.roomId,
              role: 'MEMBER' as any
            }] : [])
          ]
        });
      }

      return room.roomId;
    } catch (error) {
      logger.error('Failed to create or get room:', error);
      throw error;
    }
  }

  async updateLastReadAt(roomId: string, userId: string): Promise<void> {
    try {
      await this.prisma.userRoom.update({
        where: {
          userId_roomId: {
            userId,
            roomId
          }
        },
        data: {
          lastReadAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to update last read at:', error);
    }
  }

  async getRoomParticipants(roomId: string): Promise<string[]> {
    try {
      const participants = await this.prisma.userRoom.findMany({
        where: { roomId },
        select: { userId: true }
      });

      return participants.map((p: any) => p.userId);
    } catch (error) {
      logger.error('Failed to get room participants:', error);
      return [];
    }
  }

  async checkUserAccessToRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      const userRoom = await this.prisma.userRoom.findUnique({
        where: {
          userId_roomId: {
            userId,
            roomId
          }
        }
      });

      return !!userRoom && !userRoom.isBanned;
    } catch (error) {
      logger.error('Failed to check user access to room:', error);
      return false;
    }
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const userRooms = await this.prisma.userRoom.findMany({
        where: { userId },
        select: {
          roomId: true,
          lastReadAt: true
        }
      });

      let totalUnread = 0;

      for (const userRoom of userRooms) {
        const unreadCount = await this.prisma.message.count({
          where: {
            roomId: userRoom.roomId,
            timestamp: {
              gt: userRoom.lastReadAt
            },
            senderId: {
              not: userId
            },
            isDeleted: false
          }
        });

        totalUnread += unreadCount;
      }

      return totalUnread;
    } catch (error) {
      logger.error('Failed to get unread message count:', error);
      return 0;
    }
  }
}