import { Context } from 'telegraf';

export class ContextService {
  private static instance: ContextService;

  private constructor() { }

  public static getInstance(): ContextService {
    return this.instance ?? (this.instance = new this());
  }

  public getUserId(context: Context): number {
    return context.from.id;
  }

  public getText(context: Context): string {
    return (context as any)?.update?.message?.text ?? '';
  }
}