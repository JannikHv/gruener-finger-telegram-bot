import { ConversationService } from 'src/services';
import { Context } from 'telegraf';

export class AppController {
  private static conversationService: ConversationService = ConversationService.getInstance();

  public static onStart(context: Context): void {
    context.reply('Willkommen!');
  }

  public static onCancel(context: Context) {
    const { id: userId } = context.from;

    this.conversationService.clearUserData(userId);
    this.conversationService.clearUserState(userId);

    context.reply('Abgebrochen');
  }
}