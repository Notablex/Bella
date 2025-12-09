import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import DataLoader from 'dataloader';

export class APIDataSource {
  protected http: AxiosInstance;
  
  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for authentication
    this.http.interceptors.request.use((config: any) => {
      const token = this.context?.auth?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  protected context?: any;
  
  initialize(context: any) {
    this.context = context;
  }
  
  protected async get(path: string, params?: any) {
    try {
      const response = await this.http.get(path, { params });
      return response.data;
    } catch (error) {
      console.error(`API Error (GET ${path}):`, error);
      throw error;
    }
  }
  
  protected async post(path: string, data?: any) {
    try {
      const response = await this.http.post(path, data);
      return response.data;
    } catch (error) {
      console.error(`API Error (POST ${path}):`, error);
      throw error;
    }
  }
  
  protected async put(path: string, data?: any) {
    try {
      const response = await this.http.put(path, data);
      return response.data;
    } catch (error) {
      console.error(`API Error (PUT ${path}):`, error);
      throw error;
    }
  }
  
  protected async delete(path: string) {
    try {
      const response = await this.http.delete(path);
      return response.data;
    } catch (error) {
      console.error(`API Error (DELETE ${path}):`, error);
      throw error;
    }
  }
}

export class UserService extends APIDataSource {
  constructor() {
    super(config.services.user);
  }
  
  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }
  
  async getUsers(limit = 20, offset = 0) {
    return this.get('/users', { limit, offset });
  }
  
  async searchUsers(query: string, limit = 20) {
    return this.get('/users/search', { query, limit });
  }
  
  async createUser(userData: any) {
    return this.post('/users', userData);
  }
  
  async updateUser(id: string, userData: any) {
    return this.put(`/users/${id}`, userData);
  }
  
  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }
  
  async getUserProfile(userId: string) {
    return this.get(`/users/${userId}/profile`);
  }
  
  async updateProfile(userId: string, profileData: any) {
    return this.put(`/users/${userId}/profile`, profileData);
  }
  
  async reportUser(reportData: any) {
    return this.post('/reports', reportData);
  }
  
  async blockUser(userId: string, targetUserId: string) {
    return this.post(`/users/${userId}/block`, { targetUserId });
  }
  
  async getConnections(userId: string) {
    return this.get(`/users/${userId}/connections`);
  }
}

export class InteractionService extends APIDataSource {
  constructor() {
    super(config.services.interaction);
  }
  
  async getSession(id: string) {
    return this.get(`/sessions/${id}`);
  }
  
  async getUserSessions(userId: string, limit = 20, offset = 0) {
    return this.get(`/sessions/user/${userId}`, { limit, offset });
  }
  
  async startSession(user1Id: string, user2Id: string, type: string) {
    return this.post('/sessions', { user1Id, user2Id, type });
  }
  
  async endSession(sessionId: string) {
    return this.put(`/sessions/${sessionId}/end`);
  }
  
  async getSessionMessages(sessionId: string, limit = 50, offset = 0) {
    return this.get(`/sessions/${sessionId}/messages`, { limit, offset });
  }
}

export class CommunicationService extends APIDataSource {
  constructor() {
    super(config.services.communication);
  }
  
  async sendMessage(messageData: any) {
    return this.post('/messages', messageData);
  }
  
  async getMessages(sessionId: string, limit = 50, offset = 0) {
    return this.get(`/messages/${sessionId}`, { limit, offset });
  }
  
  async markMessageAsRead(messageId: string) {
    return this.put(`/messages/${messageId}/read`);
  }
  
  async getMessageHistory(userId: string, limit = 50, offset = 0) {
    return this.get(`/messages/history/${userId}`, { limit, offset });
  }
}

export class QueuingService extends APIDataSource {
  constructor() {
    super(config.services.queuing);
  }
  
  async joinQueue(userId: string, preferences: any) {
    return this.post('/queue/join', { userId, preferences });
  }
  
  async leaveQueue(userId: string) {
    return this.post('/queue/leave', { userId });
  }
  
  async getQueueStatus(userId: string) {
    return this.get(`/queue/status/${userId}`);
  }
  
  async updatePreferences(userId: string, preferences: any) {
    return this.put(`/queue/preferences/${userId}`, preferences);
  }
  
  async getQueueStatistics() {
    return this.get('/queue/statistics');
  }
}

export class NotificationService extends APIDataSource {
  constructor() {
    super(config.services.notification);
  }
  
  async getNotifications(userId: string, limit = 20, offset = 0) {
    return this.get(`/notifications/${userId}`, { limit, offset });
  }
  
  async getUnreadNotifications(userId: string) {
    return this.get(`/notifications/${userId}/unread`);
  }
  
  async markNotificationAsRead(notificationId: string) {
    return this.put(`/notifications/${notificationId}/read`);
  }
  
  async markAllNotificationsAsRead(userId: string) {
    return this.put(`/notifications/${userId}/read-all`);
  }
  
  async sendNotification(notificationData: any) {
    return this.post('/notifications', notificationData);
  }
}

export class AnalyticsService extends APIDataSource {
  constructor() {
    super(config.services.analytics);
  }
  
  async getAnalytics(period: string) {
    return this.get('/analytics', { period });
  }
  
  async getUserAnalytics(userId: string) {
    return this.get(`/analytics/user/${userId}`);
  }
  
  async trackEvent(eventData: any) {
    return this.post('/analytics/track', eventData);
  }
}

export class HistoryService extends APIDataSource {
  constructor() {
    super(config.services.history);
  }
  
  async logInteraction(interactionData: any) {
    return this.post('/interactions/log', interactionData);
  }
  
  async getInteractionHistory(userId: string, limit = 50, offset = 0) {
    return this.get(`/interactions/history/${userId}`, { limit, offset });
  }
  
  async logUserAction(actionData: any) {
    return this.post('/actions/log', actionData);
  }
}

export class ModerationService extends APIDataSource {
  constructor() {
    super(config.services.moderation);
  }
  
  async moderateContent(content: string, type: string) {
    return this.post('/moderate', { content, type });
  }
  
  async getModerationHistory(limit = 50, offset = 0) {
    return this.get('/moderation/history', { limit, offset });
  }
  
  async reportContent(reportData: any) {
    return this.post('/moderation/report', reportData);
  }
}

// Data Loaders for efficient batching
export function createDataLoaders() {
  const userService = new UserService();
  const interactionService = new InteractionService();
  const communicationService = new CommunicationService();
  const notificationService = new NotificationService();
  
  return {
    userLoader: new DataLoader(async (ids: readonly string[]) => {
      const users = await Promise.all(
        ids.map(id => userService.getUser(id).catch(() => null))
      );
      return users;
    }),
    
    profileLoader: new DataLoader(async (userIds: readonly string[]) => {
      const profiles = await Promise.all(
        userIds.map(userId => userService.getUserProfile(userId).catch(() => null))
      );
      return profiles;
    }),
    
    sessionLoader: new DataLoader(async (sessionIds: readonly string[]) => {
      const sessions = await Promise.all(
        sessionIds.map(id => interactionService.getSession(id).catch(() => null))
      );
      return sessions;
    }),
    
    messageLoader: new DataLoader(async (sessionIds: readonly string[]) => {
      const messageLists = await Promise.all(
        sessionIds.map(sessionId => 
          communicationService.getMessages(sessionId, 50, 0).catch(() => [])
        )
      );
      return messageLists;
    }),
    
    notificationLoader: new DataLoader(async (userIds: readonly string[]) => {
      const notificationLists = await Promise.all(
        userIds.map(userId => 
          notificationService.getNotifications(userId, 20, 0).catch(() => [])
        )
      );
      return notificationLists;
    }),
  };
}

export const dataSources = {
  userService: new UserService(),
  interactionService: new InteractionService(),
  communicationService: new CommunicationService(),
  queuingService: new QueuingService(),
  notificationService: new NotificationService(),
  analyticsService: new AnalyticsService(),
  historyService: new HistoryService(),
  moderationService: new ModerationService(),
};