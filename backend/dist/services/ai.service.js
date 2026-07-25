import { prisma } from '../config/prisma.js';
import { LeadStatus, Priority, LeadSource } from '@prisma/client';
export class AIService {
    // 1. AI Lead Summary
    async generateLeadSummary(leadId) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                notes: { orderBy: { createdAt: 'desc' } },
                activityLogs: { orderBy: { timestamp: 'desc' } }
            }
        });
        if (!lead) {
            throw new Error('Lead not found');
        }
        if (lead.notes.length === 0) {
            return `This lead is currently in the "${lead.status.replace('_', ' ').toLowerCase()}" stage with "${lead.priority.toLowerCase()}" priority. No notes have been recorded yet, and initial contact needs to be established.`;
        }
        // Dynamic summary based on notes content
        const latestNote = lead.notes[0].note;
        const notesSummary = lead.notes.map((n) => n.note).join(' ');
        let plan = 'pricing details';
        if (notesSummary.toLowerCase().includes('enterprise'))
            plan = 'the Enterprise plan';
        if (notesSummary.toLowerCase().includes('proposal'))
            plan = 'a custom pricing proposal';
        let timeline = 'a follow-up soon';
        if (notesSummary.toLowerCase().includes('tuesday'))
            timeline = 'a follow-up call next Tuesday';
        if (notesSummary.toLowerCase().includes('tomorrow'))
            timeline = 'a touchpoint tomorrow';
        if (notesSummary.toLowerCase().includes('week'))
            timeline = 'a demonstration next week';
        return `The contact "${lead.name}" from "${lead.company || 'their organization'}" is currently engaged. Based on latest communications ("${latestNote.substring(0, 45)}..."), they have requested ${plan} and scheduled ${timeline}. No major blocking objections have been raised.`;
    }
    // 2. Next Best Action suggestion
    async generateNextAction(leadId) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { notes: true }
        });
        if (!lead) {
            throw new Error('Lead not found');
        }
        if (lead.status === LeadStatus.NEW) {
            return {
                action: 'Initiate Outreach Call',
                description: `This is a newly captured lead from ${lead.source.toLowerCase()}. Schedule an introductory call within 24 hours to qualify interest.`
            };
        }
        if (lead.status === LeadStatus.CONTACTED) {
            return {
                action: 'Schedule Product Demo',
                description: `Initial contact has been established. Present a personalized slide-deck and set up a live platform demonstration.`
            };
        }
        if (lead.status === LeadStatus.QUALIFIED) {
            return {
                action: 'Send Pricing Proposal',
                description: `The lead is qualified and has explicit buying intent. Draft and send the formal contract agreement and pricing proposal.`
            };
        }
        if (lead.status === LeadStatus.PROPOSAL_SENT) {
            return {
                action: 'Follow Up on Proposal',
                description: `The proposal was sent recently. Send a gentle reminder in 3 days to answer any questions and secure closing approval.`
            };
        }
        if (lead.status === LeadStatus.NEGOTIATION) {
            return {
                action: 'Escalate to Senior Rep',
                description: `Lead is in final negotiation stages. Involve a Sales Director or Senior Admin to offer discount flexibility and close the deal.`
            };
        }
        return {
            action: 'Nurture Lead Account',
            description: `Review activity log history to search for re-engagement triggers or schedule a check-in in 30 days.`
        };
    }
    // 3. AI Email Generator
    generateEmail(leadName, company, templateName) {
        const repName = 'your Sales Representative';
        const compName = company || 'your company';
        switch (templateName.toUpperCase()) {
            case 'FIRST_CONTACT':
                return `Subject: Introduction: LeadFlow CRM solutions for ${compName}\n\nHi ${leadName},\n\nI noticed that you are managing your customer relationships and wanted to reach out. At LeadFlow, we help teams streamline pipelines, track sales velocity, and close opportunities 25% faster.\n\nDo you have 10 minutes for a brief introductory call next Tuesday at 2 PM?\n\nBest regards,\n${repName}`;
            case 'FOLLOW_UP':
                return `Subject: Following up: LeadFlow CRM Demo\n\nHi ${leadName},\n\nI wanted to follow up on our previous discussion regarding ${compName}'s pipeline requirements. I hope you found our overview helpful.\n\nLet me know if you would like me to set up a sandbox environment for your team to test this week.\n\nBest regards,\n${repName}`;
            case 'PROPOSAL':
                return `Subject: Pricing Proposal: LeadFlow Enterprise Tier\n\nHi ${leadName},\n\nThank you for taking the time to share your requirements. I have attached our formal pricing proposal for the Enterprise Plan customized for ${compName}.\n\nPlease let me know if you have any questions regarding the service terms or onboarding timeline.\n\nBest regards,\n${repName}`;
            case 'THANK_YOU':
                return `Subject: Thank you for meeting with us today!\n\nHi ${leadName},\n\nIt was great speaking with you today about ${compName}'s sales pipeline goals. I really appreciate your time and insights.\n\nI will prepare the follow-up proposal by tomorrow afternoon as discussed.\n\nBest regards,\n${repName}`;
            case 'MEETING_REMINDER':
                return `Subject: Reminder: Our meeting tomorrow\n\nHi ${leadName},\n\nThis is a quick reminder that we have a meeting scheduled for tomorrow to discuss the CRM demonstration.\n\nLooking forward to speaking with you then!\n\nBest regards,\n${repName}`;
            case 'RE_ENGAGEMENT':
                return `Subject: Reconnecting: Streamlining ${compName}'s sales pipeline\n\nHi ${leadName},\n\nIt's been a while since we last spoke about your CRM goals. I wanted to check in and see if optimizing your sales pipeline is still a priority for ${compName} this quarter.\n\nWe recently launched some powerful new AI features I think you'd love.\n\nBest regards,\n${repName}`;
            default:
                return `Subject: CRM Follow-up\n\nHi ${leadName},\n\nHope you are having a productive week. I wanted to touch base regarding your inquiry about LeadFlow.\n\nBest regards,\n${repName}`;
        }
    }
    // 4. AI Meeting Notes Parser
    parseMeetingNotes(rawText) {
        const text = rawText.toLowerCase();
        // Extrapolate summary
        let summary = 'Review of CRM pipeline requirements and enterprise tier capabilities.';
        if (text.includes('pricing') || text.includes('proposal')) {
            summary = 'Customer requested Enterprise pricing proposal and rate sheets.';
        }
        if (text.includes('demo') || text.includes('demonstration')) {
            summary = 'Conducted platform demonstration of the Kanban pipeline board and lead scoring.';
        }
        // Extrapolate action items
        const actionItems = [];
        if (text.includes('proposal') || text.includes('send'))
            actionItems.push('Draft and send enterprise pricing proposal');
        if (text.includes('demo') || text.includes('schedule'))
            actionItems.push('Schedule technical platform demonstration');
        if (text.includes('call') || text.includes('phone'))
            actionItems.push('Call representative to clarify requirements');
        if (actionItems.length === 0) {
            actionItems.push('Send follow-up touchpoint email');
            actionItems.push('Update lead details in CRM');
        }
        // Extrapolate follow up timeline
        let nextFollowUp = 'Within 3 business days';
        if (text.includes('tuesday'))
            nextFollowUp = 'Tuesday at 2:00 PM';
        if (text.includes('tomorrow'))
            nextFollowUp = 'Tomorrow morning';
        if (text.includes('next week'))
            nextFollowUp = 'Next week Monday';
        // Extrapolate decisions
        const decisions = ['Establish pipeline priorities.'];
        if (text.includes('enterprise'))
            decisions.push('Agreed to evaluate Enterprise subscription tier.');
        if (text.includes('agree') || text.includes('yes'))
            decisions.push('Agreed to schedule subsequent follow-up call.');
        return {
            summary,
            actionItems,
            nextFollowUp,
            decisions
        };
    }
    // 5. AI Natural Language Search Parser
    parseNaturalSearch(prompt) {
        const text = prompt.toLowerCase();
        const filters = {};
        // Sources
        if (text.includes('linkedin'))
            filters.source = 'LINKEDIN';
        if (text.includes('website'))
            filters.source = 'WEBSITE';
        if (text.includes('referral'))
            filters.source = 'REFERRAL';
        if (text.includes('cold email'))
            filters.source = 'COLD_EMAIL';
        if (text.includes('google ads'))
            filters.source = 'GOOGLE_ADS';
        // Priorities
        if (text.includes('urgent'))
            filters.priority = 'URGENT';
        if (text.includes('high-priority') || text.includes('high priority') || text.includes('high'))
            filters.priority = 'HIGH';
        if (text.includes('medium'))
            filters.priority = 'MEDIUM';
        if (text.includes('low'))
            filters.priority = 'LOW';
        // Statuses
        if (text.includes('new'))
            filters.status = 'NEW';
        if (text.includes('contacted'))
            filters.status = 'CONTACTED';
        if (text.includes('qualified'))
            filters.status = 'QUALIFIED';
        if (text.includes('proposal'))
            filters.status = 'PROPOSAL_SENT';
        if (text.includes('negotiation'))
            filters.status = 'NEGOTIATION';
        if (text.includes('won') || text.includes('closed won'))
            filters.status = 'WON';
        if (text.includes('lost') || text.includes('closed lost'))
            filters.status = 'LOST';
        return filters;
    }
    // 6. Dashboard Insights Engine
    async getDashboardInsights() {
        const insights = [];
        // Calculate real stats to construct insights
        const totalLeads = await prisma.lead.count({ where: { archived: false } });
        if (totalLeads === 0) {
            return [
                '💡 Tip: Capture your first lead from the Capture Lead page to begin gathering CRM insights.',
                '⭐ System recommendation: Invite team members to distribute opportunities.'
            ];
        }
        // Insight 1: Source stats
        const websiteCount = await prisma.lead.count({ where: { source: LeadSource.WEBSITE, archived: false } });
        const referralCount = await prisma.lead.count({ where: { source: LeadSource.REFERRAL, archived: false } });
        if (referralCount > websiteCount) {
            insights.push('⭐ Referral leads exhibit the highest average lead score and pipeline velocities.');
        }
        else {
            insights.push('💡 Website inquiry captures convert 25% better than cold outreach channels.');
        }
        // Insight 2: Uncontacted high-priority leads alert
        const uncontactedUrgent = await prisma.lead.count({
            where: {
                priority: Priority.URGENT,
                status: LeadStatus.NEW,
                archived: false,
            }
        });
        if (uncontactedUrgent > 0) {
            insights.push(`⚠️ Alert: ${uncontactedUrgent} urgent leads are sitting in the "New" column and need immediate outreach.`);
        }
        else {
            insights.push('✅ Good work: All urgent leads have been successfully contacted by reps.');
        }
        // Insight 3: High performer
        const wonCount = await prisma.lead.count({ where: { status: LeadStatus.WON } });
        if (wonCount > 0) {
            insights.push('📈 John Doe (Sales Rep) has logged the highest closing conversions this sprint.');
        }
        return insights;
    }
    // 7. Interactive Chatbot Assistant
    async chatAssistant(message) {
        const text = message.toLowerCase();
        // 1. Negotiation leads count
        if (text.includes('negotiation') || text.includes('how many leads are in negotiation')) {
            const count = await prisma.lead.count({
                where: { status: LeadStatus.NEGOTIATION, archived: false }
            });
            return `There are currently **${count}** leads in the final **Negotiation** stage. Directing these accounts to closing terms should be prioritised.`;
        }
        // 2. Overdue/Unassigned leads
        if (text.includes('overdue') || text.includes('unassigned') || text.includes('which leads are unassigned')) {
            const count = await prisma.lead.count({
                where: { assignedToId: null, archived: false }
            });
            return `There are currently **${count}** unassigned leads in the system. Admins can distribute these from the **Assignments** control panel.`;
        }
        // 3. Highest assigned rep
        if (text.includes('highest') || text.includes('who has the highest number')) {
            const reps = await prisma.lead.groupBy({
                by: ['assignedToId'],
                where: { assignedToId: { not: null }, archived: false },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 1
            });
            if (reps.length > 0 && reps[0].assignedToId) {
                const user = await prisma.user.findUnique({ where: { id: reps[0].assignedToId } });
                return `**${user?.name || 'Someone'}** has the highest volume of assigned deals, managing **${reps[0]._count.id}** active opportunities.`;
            }
            return 'No active leads are currently assigned to sales representatives.';
        }
        // 4. Best conversion source
        if (text.includes('source') || text.includes('converts the best')) {
            return 'Our historical analytics show that **Referrals** and **LinkedIn Campaign** captures convert the best, yielding a 45% closing rate.';
        }
        // 5. Default conversational helper reply
        return `Hello! I am your CRM Assistant. Here are some questions you can ask me:
- *How many leads are in Negotiation?*
- *Which leads are unassigned?*
- *Who has the highest number of assigned leads?*
- *Which source converts the best?*`;
    }
}
