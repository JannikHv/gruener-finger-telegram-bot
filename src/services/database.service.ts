
import StormDB from 'stormdb';
import { Plant } from 'src/types';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private static instance: DatabaseService;

  private db: StormDB;

  private constructor() {
    const engine = new StormDB.localFileEngine('data/db.json');

    this.db = new StormDB(engine);

    this.db.default({ plants: { } }).save();
  }

  public static getInstance(): DatabaseService {
    return this.instance ?? (this.instance = new this());
  }

  public listPlants(): Plant[] {
    return Object.values(this.db.get('plants').value());
  }

  public getPlantById(id: string): Plant {
    return this.db.get('plants').get(id).value();
  }

  public createPlant(plant: Partial<Plant>): Plant {
    plant.id = uuidv4();

    this.db.get('plants').set(plant.id, {
      ...plant, createdAt: Date.now()
    }).save();

    return plant as Plant;
  }

  public updatePlant(plant: Plant): Plant {
    this.db.get('plants').set(plant.id, {
      ...plant, updatedAt: Date.now()
    }).save();

    return plant;
  }

  public deletePlant(plant: Plant): void {
    return this.db.get('plants').get(plant.id).delete();
  }
}