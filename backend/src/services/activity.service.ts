import { ActivityRepository } from '../repositories/activity.repository.js';
import { ActivityLog } from '@prisma/client';

const activityRepository = new ActivityRepository();

export class ActivityService {
  async getActivityForLead(leadId: string): Promise<ActivityLog[]> {
    return activityRepository.findByLeadId(leadId);
  }

  async getRecentActivities(limit = 20): Promise<ActivityLog[]> {
    return activityRepository.findAll(limit);
  }
}
