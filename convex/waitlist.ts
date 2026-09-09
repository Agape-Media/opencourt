import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

function requireApiSecret(secret: string) {
  const configuredSecret = process.env.WAITLIST_API_SECRET;

  if (!configuredSecret || secret !== configuredSecret) {
    throw new Error('Unauthorized');
  }
}

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const emails = await ctx.db.query('waitlistEmails').collect();
    return emails.length;
  },
});

export const registerEmail = mutation({
  args: { email: v.string(), secret: v.string() },
  handler: async (ctx, { email, secret }) => {
    requireApiSecret(secret);
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await ctx.db
      .query('waitlistEmails')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    if (existing) {
      const legacyRecord = existing.deliveryTrackingEnabled !== true;

      return {
        emailId: existing._id,
        email: normalizedEmail,
        isNew: false,
        welcomeEmailSent:
          legacyRecord || existing.welcomeEmailSentAt !== undefined,
        notificationEmailSent:
          legacyRecord || existing.notificationEmailSentAt !== undefined,
      };
    }

    const emailId = await ctx.db.insert('waitlistEmails', {
      email: normalizedEmail,
      signupDate: Date.now(),
      notified: false,
      deliveryTrackingEnabled: true,
    });

    return {
      emailId,
      email: normalizedEmail,
      isNew: true,
      welcomeEmailSent: false,
      notificationEmailSent: false,
    };
  },
});

export const markEmailSent = mutation({
  args: {
    emailId: v.id('waitlistEmails'),
    emailType: v.union(v.literal('welcome'), v.literal('notification')),
    secret: v.string(),
  },
  handler: async (ctx, { emailId, emailType, secret }) => {
    requireApiSecret(secret);
    const sentAt = Date.now();

    if (emailType === 'welcome') {
      await ctx.db.patch(emailId, { welcomeEmailSentAt: sentAt });
    } else {
      await ctx.db.patch(emailId, { notificationEmailSentAt: sentAt });
    }
  },
});

export const normalizeExistingEmails = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    requireApiSecret(secret);
    const emails = await ctx.db.query('waitlistEmails').collect();
    const seen = new Set<string>();
    let normalizedCount = 0;
    let duplicateCount = 0;

    for (const record of emails) {
      const normalizedEmail = record.email.trim().toLowerCase();

      if (seen.has(normalizedEmail)) {
        await ctx.db.delete(record._id);
        duplicateCount += 1;
      } else {
        seen.add(normalizedEmail);

        if (record.email !== normalizedEmail) {
          await ctx.db.patch(record._id, { email: normalizedEmail });
          normalizedCount += 1;
        }
      }
    }

    return { normalizedCount, duplicateCount };
  },
});

export const importLegacyEmails = mutation({
  args: {
    emails: v.array(
      v.object({
        email: v.string(),
        signupDate: v.number(),
        notified: v.optional(v.boolean()),
      })
    ),
    secret: v.string(),
  },
  handler: async (ctx, { emails, secret }) => {
    requireApiSecret(secret);
    let importedCount = 0;

    for (const record of emails) {
      const email = record.email.trim().toLowerCase();
      const existing = await ctx.db
        .query('waitlistEmails')
        .withIndex('by_email', (q) => q.eq('email', email))
        .first();

      if (!existing) {
        await ctx.db.insert('waitlistEmails', {
          email,
          signupDate: record.signupDate,
          notified: record.notified,
        });
        importedCount += 1;
      }
    }

    return { importedCount };
  },
});

export const getUnnotifiedEmails = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    requireApiSecret(secret);
    return await ctx.db
      .query('waitlistEmails')
      .filter((q) => q.neq(q.field('notified'), true))
      .collect();
  },
});

export const markEmailsAsNotified = mutation({
  args: {
    emailIds: v.array(v.id('waitlistEmails')),
    secret: v.string(),
  },
  handler: async (ctx, { emailIds, secret }) => {
    requireApiSecret(secret);
    for (const id of emailIds) {
      await ctx.db.patch(id, { notified: true });
    }
    return { success: true, count: emailIds.length };
  },
});
