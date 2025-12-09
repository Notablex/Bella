import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { stripe } from '../services/stripe';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Stripe webhook endpoint
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  logger.info(`Received Stripe webhook: ${event.type}`, { eventId: event.id });

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'invoice.created':
        await handleInvoiceCreated(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle subscription created
async function handleSubscriptionCreated(subscription: any) {
  logger.info(`Processing subscription created: ${subscription.id}`);
  
  try {
    // Update subscription status in database
    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        isTrialActive: subscription.status === 'trialing',
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      }
    });

    logger.info(`Updated subscription in database: ${subscription.id}`);
  } catch (error) {
    logger.error(`Error updating subscription ${subscription.id}:`, error);
    throw error;
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: any) {
  logger.info(`Processing subscription updated: ${subscription.id}`);

  try {
    const updateData: any = {
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      isTrialActive: subscription.status === 'trialing'
    };

    // Handle cancellation
    if (subscription.cancel_at_period_end) {
      updateData.cancelAt = new Date(subscription.current_period_end * 1000);
      updateData.autoRenew = false;
    } else if (subscription.status === 'active') {
      updateData.cancelAt = null;
      updateData.autoRenew = true;
    }

    // Handle immediate cancellation
    if (subscription.status === 'canceled') {
      updateData.canceledAt = new Date();
      updateData.endedAt = new Date();
    }

    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: updateData
    });

    logger.info(`Updated subscription status: ${subscription.id} -> ${subscription.status}`);
  } catch (error) {
    logger.error(`Error updating subscription ${subscription.id}:`, error);
    throw error;
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: any) {
  logger.info(`Processing subscription deleted: ${subscription.id}`);

  try {
    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        endedAt: new Date()
      }
    });

    logger.info(`Marked subscription as canceled: ${subscription.id}`);
  } catch (error) {
    logger.error(`Error marking subscription as canceled ${subscription.id}:`, error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: any) {
  logger.info(`Processing invoice payment succeeded: ${invoice.id}`);

  try {
    // Update invoice status
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'PAID',
        paidAt: new Date(invoice.status_transitions.paid_at * 1000)
      }
    });

    // Create payment record
    const subscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (subscription) {
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'SUCCEEDED',
          paymentMethod: 'CARD',
          stripeChargeId: invoice.charge,
          processedAt: new Date(invoice.status_transitions.paid_at * 1000)
        }
      });

      // Update subscription renewal notification flag
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { renewalNotifiedAt: null } // Reset for next billing cycle
      });
    }

    logger.info(`Processed successful payment for invoice: ${invoice.id}`);
  } catch (error) {
    logger.error(`Error processing successful payment for invoice ${invoice.id}:`, error);
    throw error;
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: any) {
  logger.info(`Processing invoice payment failed: ${invoice.id}`);

  try {
    // Update invoice status
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        attemptedAt: new Date()
      }
    });

    // Create failed payment record
    const subscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (subscription) {
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          amount: invoice.amount_due / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'FAILED',
          paymentMethod: 'CARD',
          failedAt: new Date(),
          failureCode: 'payment_failed',
          failureMessage: 'Invoice payment failed'
        }
      });

      // Update subscription status if needed
      if (invoice.attempt_count >= (process.env.PAYMENT_RETRY_ATTEMPTS || 3)) {
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' }
        });
      }
    }

    logger.info(`Processed failed payment for invoice: ${invoice.id}`);
  } catch (error) {
    logger.error(`Error processing failed payment for invoice ${invoice.id}:`, error);
    throw error;
  }
}

// Handle invoice created
async function handleInvoiceCreated(invoice: any) {
  logger.info(`Processing invoice created: ${invoice.id}`);

  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (subscription) {
      // Create invoice record
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          invoiceNumber: invoice.number || `INV-${Date.now()}`,
          status: invoice.status === 'paid' ? 'PAID' : 'PENDING',
          subtotal: invoice.subtotal / 100,
          discountAmount: (invoice.discount?.amount || 0) / 100,
          taxAmount: invoice.tax || 0,
          totalAmount: invoice.total / 100,
          currency: invoice.currency.toUpperCase(),
          periodStart: new Date(invoice.period_start * 1000),
          periodEnd: new Date(invoice.period_end * 1000),
          dueDate: new Date(invoice.due_date * 1000),
          stripeInvoiceId: invoice.id,
          lineItems: invoice.lines.data || []
        }
      });
    }

    logger.info(`Created invoice record: ${invoice.id}`);
  } catch (error) {
    logger.error(`Error creating invoice record ${invoice.id}:`, error);
    throw error;
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  logger.info(`Processing payment intent succeeded: ${paymentIntent.id}`);

  try {
    // Update payment record if exists
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        processedAt: new Date()
      }
    });

    logger.info(`Updated payment intent: ${paymentIntent.id}`);
  } catch (error) {
    logger.error(`Error updating payment intent ${paymentIntent.id}:`, error);
    throw error;
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: any) {
  logger.info(`Processing payment intent failed: ${paymentIntent.id}`);

  try {
    // Update payment record if exists
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureCode: paymentIntent.last_payment_error?.code || 'unknown',
        failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed'
      }
    });

    logger.info(`Updated failed payment intent: ${paymentIntent.id}`);
  } catch (error) {
    logger.error(`Error updating failed payment intent ${paymentIntent.id}:`, error);
    throw error;
  }
}

// Handle customer created
async function handleCustomerCreated(customer: any) {
  logger.info(`Processing customer created: ${customer.id}`);
  // This is mainly for logging purposes
  // Customer creation is typically handled when creating subscriptions
}

export default router;