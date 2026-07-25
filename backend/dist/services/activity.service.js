import { ActivityRepository } from '../repositories/activity.repository.js';
const activityRepository = new ActivityRepository();
export class ActivityService {
    async getActivityForLead(leadId) {
        return activityRepository.findByLeadId(leadId);
    }
    async getRecentActivities(limit = 20) {
        return activityRepository.findAll(limit);
    }
}
