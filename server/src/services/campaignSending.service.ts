import { Campaign, ICampaign } from '../models/Campaign';
import { CampaignRecipient } from '../models/CampaignRecipient';
import { Lead } from '../models/Lead';
import { Suppression } from '../models/Suppression';
import { EmailLog } from '../models/EmailLog';
import { EmailTemplate } from '../models/EmailTemplate';
import { Organization } from '../models/Organization';
import { gmailService } from './gmail/gmail.service';
import { aiService } from './ai/ai.service';
import { logger } from '../utils/logger';

export class CampaignSendingService {
  async executeCampaignSend(campaignId: string, senderUserEmail: string): Promise<any> {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'Approved' && campaign.status !== 'Running') {
      throw new Error(`Campaign status is '${campaign.status}'. Only 'Approved' or 'Running' campaigns can be executed.`);
    }

    campaign.status = 'Running';
    await campaign.save();

    const template = await EmailTemplate.findById(campaign.templateId);
    if (!template) {
      throw new Error('Email template linked to campaign was not found.');
    }

    const org = await Organization.findOne() || { dailyEmailLimit: 100, name: 'Apex Industrial Exports' };

    // Fetch pending recipients
    const recipients = await CampaignRecipient.find({
      campaignId: campaign._id,
      status: { $in: ['Pending', 'Personalized'] },
    });

    let sentCount = 0;
    let failedCount = 0;
    let suppressedCount = 0;

    for (const recipient of recipients) {
      // 1. Check daily sending limit
      if (campaign.stats.sentCount + sentCount >= campaign.dailySendingLimit) {
        logger.warn(`Campaign ${campaign.name} reached daily sending limit of ${campaign.dailySendingLimit}. Pausing remaining queue.`);
        campaign.status = 'Paused';
        await campaign.save();
        break;
      }

      const lead = await Lead.findById(recipient.leadId);
      if (!lead) {
        recipient.status = 'Invalid';
        recipient.errorMessage = 'Lead document no longer exists';
        await recipient.save();
        continue;
      }

      // 2. Check email validation safety gate
      if (lead.validationStatus === 'Invalid' || lead.validationStatus === 'Disposable') {
        recipient.status = 'Invalid';
        recipient.errorMessage = `Blocked by validation safety gate: Email status is '${lead.validationStatus}'`;
        await recipient.save();
        campaign.stats.invalidRecipients += 1;
        continue;
      }

      // 3. Check suppression list safety gate
      const isSuppressed = await Suppression.findOne({ email: lead.email });
      if (isSuppressed) {
        recipient.status = 'Suppressed';
        recipient.errorMessage = `Blocked by suppression list: Reason '${isSuppressed.reason}'`;
        await recipient.save();
        suppressedCount++;
        campaign.stats.suppressedRecipients += 1;
        lead.leadStatus = 'Suppressed';
        await lead.save();
        continue;
      }

      // 4. Personalize subject & body if not already done
      let subject = recipient.personalizedSubject;
      let body = recipient.personalizedBody;

      if (!subject || !body) {
        const personalizationRes = await aiService.personalizeEmail({
          lead,
          template,
          productName: campaign.product,
          organizationName: org.name,
        });
        subject = personalizationRes.subject;
        body = personalizationRes.body;
        recipient.personalizedSubject = subject;
        recipient.personalizedBody = body;
      }

      // 5. Create Email Log record
      const emailLog = await EmailLog.create({
        leadId: lead._id,
        campaignId: campaign._id,
        sender: senderUserEmail,
        recipient: lead.email,
        subject,
        body,
        status: 'Sending',
      });

      // 6. Send email via Gmail service adapter
      const sendRes = await gmailService.sendEmail({
        senderEmail: senderUserEmail,
        recipientEmail: lead.email,
        subject,
        body,
      });

      if (sendRes.success) {
        emailLog.status = 'Sent';
        emailLog.sentAt = new Date();
        emailLog.messageId = sendRes.messageId;
        emailLog.threadId = sendRes.threadId;
        await emailLog.save();

        recipient.status = 'Sent';
        recipient.sentAt = new Date();
        recipient.emailLogId = emailLog._id;
        await recipient.save();

        lead.leadStatus = 'Contacted';
        lead.outreachStatus = 'Email Sent';
        lead.lastContacted = new Date();
        await lead.save();

        sentCount++;
        campaign.stats.sentCount += 1;
      } else {
        emailLog.status = 'Failed';
        emailLog.error = sendRes.error;
        await emailLog.save();

        recipient.status = 'Failed';
        recipient.errorMessage = sendRes.error;
        await recipient.save();

        failedCount++;
        campaign.stats.failedCount += 1;
      }
    }

    // Update campaign status if queue completed
    const remainingPending = await CampaignRecipient.countDocuments({
      campaignId: campaign._id,
      status: { $in: ['Pending', 'Personalized'] },
    });

    if (remainingPending === 0) {
      campaign.status = 'Completed';
    }
    await campaign.save();

    logger.info(`Campaign ${campaign.name} execution cycle finished: ${sentCount} sent, ${failedCount} failed, ${suppressedCount} suppressed.`);

    return {
      campaignStatus: campaign.status,
      sentCount,
      failedCount,
      suppressedCount,
      remainingPending,
    };
  }
}

export const campaignSendingService = new CampaignSendingService();
