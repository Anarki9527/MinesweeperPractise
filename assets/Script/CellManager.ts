import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

const enum TYPE {  //格子類型
  ZERO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  CLICKEDBOMB = 9,  //被點到的炸彈
  BOMB = 10  //其他炸彈
}

const enum STATE {
  NONE = 0,//未點擊
  CLIKED = 1,//已點開
  FLAG = 2,//插旗
  DOUBT = 3,//問號
}




@ccclass('CellManager')
export class CellManager extends Component {

  @property({ type: SpriteFrame })
  public picNone: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picFlag: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picDoubt: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picZero: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picOne: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picTwo: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picThree: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picFour: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picFive: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picSix: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picSeven: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picEight: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picBombBlowUp: SpriteFrame | null = null;
  @property({ type: SpriteFrame })
  public picBomb: SpriteFrame | null = null;

  public tag!: number; //辨識不同格子用的號碼

  private _state: STATE = STATE.NONE;  //此格的類型：還未點開、已被點開、插上旗幟、疑問(?)
  private _sprite: Sprite | null = null;  //此格的Sprite

  public type: TYPE = TYPE.ZERO;  //此格周圍的地雷數量標記

  set state(value: STATE) {   //設定此格的狀態和圖像
    this._state = value;
    if (this._sprite)
      switch (this._state) {
        case STATE.NONE:
          this._sprite.spriteFrame = this.picNone;
          break;
        case STATE.CLIKED:
          this.showType();
          break;
        case STATE.FLAG:
          this._sprite.spriteFrame = this.picFlag;
          break;
        case STATE.DOUBT:
          this._sprite.spriteFrame = this.picDoubt;
          break;
        default: break;
      }    
  }

  get state() {
    return this._state;
  }

  showType() {  //此格被點開後，周圍的地雷數量標記
    if (this._sprite)
      switch (this.type) {
        case TYPE.ZERO:
          this._sprite.spriteFrame = this.picZero;
          break;
        case TYPE.ONE:
          this._sprite.spriteFrame = this.picOne;
          break;
        case TYPE.TWO:
          this._sprite.spriteFrame = this.picTwo;
          break;
        case TYPE.THREE:
          this._sprite.spriteFrame = this.picThree;
          break;
        case TYPE.FOUR:
          this._sprite.spriteFrame = this.picFour;
          break;
        case TYPE.FIVE:
          this._sprite.spriteFrame = this.picFive;
          break;
        case TYPE.SIX:
          this._sprite.spriteFrame = this.picSix;
          break;
        case TYPE.SEVEN:
          this._sprite.spriteFrame = this.picSeven;
          break;
        case TYPE.EIGHT:
          this._sprite.spriteFrame = this.picEight;
          break;
        case TYPE.CLICKEDBOMB:
          this._sprite.spriteFrame = this.picBombBlowUp;
          break;
        case TYPE.BOMB:
          this._sprite.spriteFrame = this.picBomb;
          break;

        default: break;
      }
  }

  start() {
    this._sprite = this.getComponent(Sprite);
  }

}

