import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service';
import { trackEventSchema, analyticsQuerySchema, analyticsSummarySchema } from './analytics.validation';

export async function trackEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = trackEventSchema.parse(req.body);
    const event = await analyticsService.trackEvent({
      ...data,
      metadata: data.metadata as any,
      userId: req.user?.userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const result = await analyticsService.getEvents(query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getEventById(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await analyticsService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { dateFrom, dateTo } = analyticsSummarySchema.parse(req.query);
    const summary = await analyticsService.getSummary(dateFrom, dateTo);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
}

export async function deleteEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { dateFrom, dateTo } = analyticsSummarySchema.parse(req.query);
    const result = await analyticsService.deleteEvents(dateFrom, dateTo);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
