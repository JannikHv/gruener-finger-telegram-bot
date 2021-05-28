import { ConversationState } from 'src/types';

export class ConversationService {
  private static instance: ConversationService;

  private conversationStates: Map<number, ConversationState> = new Map();
  private conversationData: Map<number, any> = new Map();
  private _isLocked: boolean = false;

  private constructor() { }

  public static getInstance(): ConversationService {
    return this.instance ?? (this.instance = new this());
  }

  public lock(): void {
    this._isLocked = true;
  }

  public unlock(): void {
    this._isLocked = false;
  }

  public isLocked(): boolean {
    return this._isLocked;
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