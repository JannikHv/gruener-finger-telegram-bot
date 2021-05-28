require('dotenv').config();

import { ContextService, ConversationService } from 'src/services';
import { AppController, PlantController } from 'src/controllers';
import { ConversationState } from 'src/types';
import { Telegraf, Context } from 'telegraf';

const bot: Telegraf = new Telegraf(process.env.TOKEN);
const contextService: ContextService = ContextService.getInstance();
const conversationService: ConversationService = ConversationService.getInstance();

const runLocked = async (f: Function): Promise<void> => {
  while (conversationService.isLocked()) { }

  conversationService.lock();

  try { await f(); }
  catch(err) { }

  conversationService.unlock();
};

bot.command('start', (c: Context) => runLocked(() => AppController.onStart(c)));
bot.command('cancel', (c: Context) => runLocked(() => AppController.onCancel(c)));
bot.command('newplant', (c: Context) => runLocked(() => PlantController.onNew(c)));
bot.command('listplants', (c: Context) => runLocked(() => PlantController.onList(c)));
bot.command('deleteplant', (c: Context) => runLocked(() => PlantController.onDelete(c)));
bot.command('editplant', (c: Context) => runLocked(() => PlantController.onEdit(c)));

bot.on('message', (context: Context) => {
  const userId: number = contextService.getUserId(context);
  const state: ConversationState = conversationService.getUserState(userId);

  switch (state) {
    case ConversationState.PLANT_EDIT_CHOOSE:
      return runLocked(() => PlantController.onChooseToEdit(context));

    case ConversationState.PLANT_EDIT_ASK_NAME:
      return runLocked(() => PlantController.onEditAskName(context));

    case ConversationState.PLANT_EDIT_ASK_WATER_INTERVAL:
      return runLocked(() => PlantController.onEditAskWaterInterval(context));

    case ConversationState.PLANT_NEW_ASK_NAME:
      return runLocked(() => PlantController.onNewAskName(context));

    case ConversationState.PLANT_NEW_ASK_WATER_INTERVAL:
      return runLocked(() => PlantController.onNewAskWaterInterval(context));

    case ConversationState.PLANT_DELETE_CHOOSE:
      return runLocked(() => PlantController.onChooseToDelete(context));
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));