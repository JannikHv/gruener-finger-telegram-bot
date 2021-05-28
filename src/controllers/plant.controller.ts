import { Context } from 'telegraf';
import { ContextService, DatabaseService, ConversationService } from 'src/services';
import { Plant, ConversationState } from 'src/types';
import { Markup } from 'telegraf';

export class PlantController {
  private static contextService: ContextService = ContextService.getInstance();
  private static databaseService: DatabaseService = DatabaseService.getInstance();
  private static conversationService: ConversationService = ConversationService.getInstance();

  public static async onList(context: Context): Promise<void> {
    const plants: Plant[] = this.databaseService.listPlants();

    if (plants.length > 0) {
      await context.reply('Deine Pflanzen:');

      for (const plant of plants) {
        await context.reply(`🌱 ${plant.name} | 💦 ${plant.waterInterval} Tag(e)`);
      }
    } else {
      await context.reply('Zurzeit hast du keine Pflanzen hinterlegt...');
    }
  }

  public static async onNew(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);

    this.conversationService.setUserState(userId, ConversationState.PLANT_NEW_ASK_NAME);
    this.conversationService.setUserData(userId, { });

    await context.reply('Wie heißt die Pflanze?');
  }

  public static async onNewAskName(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const text: string = this.contextService.getText(context);

    if (this.databaseService.getPlantByName(text)) {
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      await context.reply(`Du hast bereits eine Pflanze mit dem Namen ${text}`);
    } else {
      this.conversationService.setUserData(userId, {
        ...this.conversationService.getUserData(userId),
        name: text
      });
      this.conversationService.setUserState(userId, ConversationState.PLANT_NEW_ASK_WATER_INTERVAL);

      await context.reply('Wie oft muss sie gegossen werden? (Angabe in Tagen)');
    }
  }

  public static async onNewAskWaterInterval(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const interval: number = parseInt(this.contextService.getText(context));

    if (isNaN(interval)) {
      await context.reply('Das ist kein valider Nummernwert');
    } else {
      const plant: Plant = this.databaseService.createPlant({
        ...this.conversationService.getUserData(userId),
        waterInterval: interval
      });

      this.conversationService.clearUserState(userId);
      this.conversationService.clearUserData(userId);

      await context.reply(`Deine Pflanze ${plant.name} wurde erstellt!`);
    }
  }

  public static async onEdit(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const plants: Plant[] = this.databaseService.listPlants();

    this.conversationService.setUserState(userId, ConversationState.PLANT_EDIT_CHOOSE);

    await context.reply('Welche Pflanze willst du bearbeiten?', {
      reply_markup: {
        keyboard: plants.map((p: Plant) => [Markup.button.callback(p.name, p.name)])
       }
    });
  }

  public static async onChooseToEdit(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const name: string = this.contextService.getText(context);
    const plant: Plant = this.databaseService.getPlantByName(name);

    if (plant) {
      this.conversationService.setUserData(userId, plant);
      this.conversationService.setUserState(userId, ConversationState.PLANT_EDIT_ASK_NAME);

      await context.reply('Wie heißt die Pflanze?', {
        reply_markup: { remove_keyboard: true }
      });
    } else {
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      await context.reply('Es existiert keine Pflanze mit diesem Namen...', {
        reply_markup: { remove_keyboard: true }
      });
    }
  }

  public static async onEditAskName(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const text: string = this.contextService.getText(context);

    this.conversationService.setUserData(userId, {
      ...this.conversationService.getUserData(userId),
      name: text
    });
    this.conversationService.setUserState(userId, ConversationState.PLANT_EDIT_ASK_WATER_INTERVAL);

    await context.reply('Wie oft muss sie gegossen werden? (Angabe in Tagen)');
  }

  public static async onEditAskWaterInterval(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const interval: number = parseInt(this.contextService.getText(context));

    if (isNaN(interval)) {
      await context.reply('Das ist kein valider Nummernwert');
    } else {
      const plant: Plant = this.databaseService.updatePlant({
        ...this.conversationService.getUserData(userId),
        waterInterval: interval
      });

      this.conversationService.clearUserState(userId);
      this.conversationService.clearUserData(userId);

      await context.reply(`Deine Pflanze ${plant.name} wurde gespeichert!`);
    }
  }


  public static async onDelete(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const plants: Plant[] = this.databaseService.listPlants();

    this.conversationService.setUserState(userId, ConversationState.PLANT_DELETE_CHOOSE);

    await context.reply('Welche Pflanze willst du löschen?', {
      reply_markup: {
        keyboard: plants.map((p: Plant) => [
          Markup.button.callback(p.name, p.name)
        ])
       }
    });
  }

  public static async onChooseToDelete(context: Context): Promise<void> {
    const userId: number = this.contextService.getUserId(context);
    const name: string = this.contextService.getText(context);
    const plant: Plant = this.databaseService.getPlantByName(name);

    if (plant) {
      this.databaseService.deletePlant(plant);
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      await context.reply(`Deine Pflanze ${plant.name} wurde gelöscht`, {
        reply_markup: { remove_keyboard: true }
      });
    } else {
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      await context.reply('Da ist wohl etwas schiefgelaufen...', {
        reply_markup: { remove_keyboard: true }
      });
    }
  }
}
