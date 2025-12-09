import { Router, Request, Response } from 'express';
import { QueueManager } from '../services/queueManager';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('queue-routes');

// Add user to queue
router.post('/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, intent, gender, age, latitude, longitude, interests, languages, ethnicity } = req.body;

    // Validation
    if (!userId || !intent || !gender) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, intent, gender'
      });
      return;
    }

    const queueData = {
      userId,
      intent,
      gender,
      age,
      latitude,
      longitude,
      interests: interests || [],
      languages: languages || [],
      ethnicity
    };

    const success = await QueueManager.addUserToQueue(queueData);

    if (success) {
      res.json({
        status: 'success',
        message: 'Successfully added to queue',
        data: { userId, intent }
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to add user to queue'
      });
    }
  } catch (error) {
    logger.error('Error joining queue:', error as Error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Remove user from queue
router.post('/leave', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required field: userId'
      });
      return;
    }

    const success = await QueueManager.removeUserFromQueue(userId);

    if (success) {
      res.json({
        status: 'success',
        message: 'Successfully removed from queue'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to remove user from queue'
      });
    }
  } catch (error) {
    logger.error('Error leaving queue:', error as Error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get queue status for user
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const status = await QueueManager.getQueueStatus(userId);

    res.json({
      status: 'success',
      data: status
    });
  } catch (error) {
    logger.error('Error getting queue status:', error as Error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get queue statistics (admin only)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await QueueManager.getQueueStats();

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('Error getting queue stats:', error as Error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

export default router;