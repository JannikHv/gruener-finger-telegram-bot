import { ConversationService, ContextService } from 'src/services';
import { Context } from 'telegraf';

export class AppController {
  private static conversationService: ConversationService = ConversationService.getInstance();
  private static contextService: ContextService = ContextService.getInstance();

  public static async onStart(context: Context): Promise<void> {
    context.reply('Willkommen!');
  }

  public static async onCancel(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);

    this.conversationService.clearUserData(userId);
    this.conversationService.clearUserState(userId);

    await context.reply('Abgebrochen');
  }
}