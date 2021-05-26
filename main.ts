require('dotenv').config();

import { ContextService, ConversationService, ConversationState } from 'src/services';
import { Telegraf, Context } from 'telegraf';
import { AppController, PlantController } from './src/controllers';

const bot: Telegraf = new Telegraf(process.env.TOKEN);
const contextService: ContextService = ContextService.getInstance();
const conversationService: ConversationService = ConversationService.getInstance();

bot.command('start', (c: Context) => AppController.onStart(c));
bot.command('cancel', (c: Context) => AppController.onCancel(c));

bot.command('newplant', (c: Context) => PlantController.onNew(c));
bot.command('listplants', (c: Context) => PlantController.onList(c));
bot.command('deleteplant', (c: Context) => PlantController.onDelete(c));
bot.command('editplant', (c: Context) => PlantController.onEdit(c));

bot.on('message', (context: Context) => {
  const userId: number = contextService.getUserId(context);
  const state: ConversationState = conversationService.getUserState(userId);

  switch (state) {
    case ConversationState.PLANT_ASK_NAME: return PlantController.onAskName(context);
    case ConversationState.PLANT_ASK_WATER_INTERVAL: return PlantController.onAskWaterInterval(context);
    case ConversationState.PLANT_EDIT_CHOOSE: return PlantController.onChooseToEdit(context);
    case ConversationState.PLANT_DELETE_CHOOSE: return PlantController.onChooseToDelete(context);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));