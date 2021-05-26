import { Context } from 'telegraf';
import { ContextService, DatabaseService, ConversationService, ConversationState } from 'src/services';
import { Plant } from 'src/types';

export class PlantController {
  private static contextService: ContextService = ContextService.getInstance();
  private static databaseService: DatabaseService = DatabaseService.getInstance();
  private static conversationService: ConversationService = ConversationService.getInstance();

  public static onList(context: Context): void {
    const plants: Plant[] = this.databaseService.listPlants();

    context.reply(
      plants
        .map((plant: Plant) => [
          plant.name,
          ` 💧 ${plant.waterInterval} Tag(e)\n`
        ].join('\n'))
        .join('\n')
    );
  }

  public static onNew(context: Context): void {
    const userId: number = this.contextService.getUserId(context);

    this.conversationService.setUserState(userId, ConversationState.PLANT_ASK_NAME);
    this.conversationService.setUserData(userId, { });

    context.reply('Wie heißt die Pflanze?');
  }

  public static onAskName(context: Context): void {
    const userId: number = this.contextService.getUserId(context);
    const text: string = this.contextService.getText(context);

    this.conversationService.setUserData(userId, {
      ...this.conversationService.getUserData(userId),
      name: text
    });
    this.conversationService.setUserState(userId, ConversationState.PLANT_ASK_WATER_INTERVAL);

    context.reply('Wie oft muss sie gegossen werden? (Angabe in Tagen)');
  }

  public static onAskWaterInterval(context: Context): void {
    const userId: number = this.contextService.getUserId(context);
    const interval: number = parseInt(this.contextService.getText(context));

    if (isNaN(interval)) {
      context.reply('Das ist kein valider Nummernwert');
    } else {
      const plant: Plant = this.databaseService.createPlant({
        ...this.conversationService.getUserData(userId),
        waterInterval: interval
      });

      this.conversationService.clearUserState(userId);
      this.conversationService.clearUserData(userId);

      context.reply(`Deine Pflanze ${plant.name} wurde gespeichert!`);
    }
  }

  public static onEdit(context: Context): void {
    const userId: number = this.contextService.getUserId(context);
    const plants: Plant[] = this.databaseService.listPlants();
    const list: string = plants.map((p: Plant, i: number) => `[${i}] ${p.name}`).join('\n');

    this.conversationService.setUserState(userId, ConversationState.PLANT_EDIT_CHOOSE);

    context.reply('Welche Pflanze willst du bearbeiten?')
    context.reply(list);
  }

  public static onChooseToEdit(context: Context): void {
    const userId: number = this.contextService.getUserId(context);
    const index: number = parseInt(this.contextService.getText(context));
    const plants: Plant[] = this.databaseService.listPlants();

    if (index in plants) {
      const plant: Plant = plants[index];

      this.conversationService.setUserData(userId, plant);
      this.conversationService.setUserState(userId, ConversationState.PLANT_ASK_NAME);

      context.reply('Wie soll die Pflanze heißen?');
    } else {
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      context.reply('Da ist wohl etwas schiefgelaufen...');
    }
  }

  public static onDelete(context: Context): void {
    const userId: number = this.contextService.getUserId(context);
    const plants: Plant[] = this.databaseService.listPlants();
    const list: string = plants.map((p: Plant, i: number) => `[${i}] ${p.name}`).join('\n');

    this.conversationService.setUserState(userId, ConversationState.PLANT_DELETE_CHOOSE);

    context.reply('Welche Pflanze willst du löschen?')
    context.reply(list);
  }

  public static onChooseToDelete(context: Context): void {
    const userId: number = this.contextService.getUserId(context);
    const index: number = parseInt(this.contextService.getText(context));
    const plants: Plant[] = this.databaseService.listPlants();

    if (index in plants) {
      const plant: Plant = plants[index];

      this.databaseService.deletePlant(plant);
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      context.reply(`Deine Pflanze ${plant.name} wurde gelöscht`);
    } else {
      this.conversationService.clearUserData(userId);
      this.conversationService.clearUserState(userId);

      context.reply('Da ist wohl etwas schiefgelaufen...');
    }
  }
}
