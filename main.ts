require('dotenv').config();

import { ContextService, ConversationService } from 'src/services';
import { AppController, PlantController } from 'src/controllers';
import { ConversationState } from 'src/types';
import { Telegraf, Context } from 'telegraf';

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
    case ConversationState.PLANT_EDIT_CHOOSE: return PlantController.onChooseToEdit(context);
    case ConversationState.PLANT_EDIT_ASK_NAME: return PlantController.onEditAskName(context);
    case ConversationState.PLANT_EDIT_ASK_WATER_INTERVAL: return PlantController.onEditAskWaterInterval(context);
    case ConversationState.PLANT_NEW_ASK_NAME: return PlantController.onNewAskName(context);
    case ConversationState.PLANT_NEW_ASK_WATER_INTERVAL: return PlantController.onNewAskWaterInterval(context);
    case ConversationState.PLANT_DELETE_CHOOSE: return PlantController.onChooseToDelete(context);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));