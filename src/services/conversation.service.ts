export enum ConversationState {
  NONE,
  PLANT_ASK_NAME,
  PLANT_ASK_WATER_INTERVAL,
  PLANT_EDIT_CHOOSE,
  PLANT_DELETE_CHOOSE
};

export class ConversationService {
  private static instance: ConversationService;

  private conversationStates: Map<number, ConversationState> = new Map();
  private conversationData: Map<number, any> = new Map();

  private constructor() { }

  public static getInstance(): ConversationService {
    return this.instance ?? (this.instance = new this());
  }

  public setUserState(userId: number, state: ConversationState): void {
    this.conversationStates.set(userId, state);
  }

  public getUserState(userId: number): ConversationState {
    return this.conversationStates.get(userId) ?? ConversationState.NONE;
  }

  public clearUserState(userId: number): void {
    this.conversationStates.delete(userId);
  }

  public setUserData(userId: number, data: any): void {
    this.conversationData.set(userId, data);
  }

  public getUserData(userId: number): any {
    return this.conversationData.get(userId) ?? { };
  }

  public clearUserData(userId: number): void {
    this.conversationData.delete(userId);
  }
}