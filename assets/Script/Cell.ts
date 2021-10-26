import { _decorator, Component, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass } = _decorator;

export const enum TYPE {  //格子類型
  ZERO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  BOMB = 9,  //被點到的炸彈
  CLICKEDBOMB = 10  //其他炸彈
}

export const enum STATE {
  NONE = 0,//未點擊
  CLICKED = 1,//已點開
  FLAG = 2,//插旗
  DOUBT = 3,//問號
}

@ccclass('Cell')
export class Cell extends Component {
    public tag!: number; //辨識不同格子用的號碼

    private _state: STATE = STATE.NONE;  //此格的類型：還未點開、已被點開、插上旗幟、疑問(?)
    private _sprite!: Sprite;  //此格的Sprite
  
    public type: TYPE = TYPE.ZERO;  //此格周圍的地雷數量標記
  
    set state(value: STATE) {   //設定此格的狀態和圖像
      this._state = value;
      switch (this._state) {
        case STATE.NONE:
          resources.load("images/none/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => { //從resources中載入
            this._sprite.spriteFrame = asset;
          })
          break;
        case STATE.CLICKED:
          this.showType();
          break;
        case STATE.FLAG:
          resources.load("images/mineflagnew/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
            this._sprite.spriteFrame = asset;
          })
          break;
        case STATE.DOUBT:
          resources.load("images/questioncell/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
            this._sprite.spriteFrame = asset;
          })
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
            resources.load("images/00/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.ONE:
            resources.load("images/01/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.TWO:
            resources.load("images/02/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.THREE:
            resources.load("images/03/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.FOUR:
            resources.load("images/04/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.FIVE:
            resources.load("images/05/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.SIX:
            resources.load("images/06/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.SEVEN:
            resources.load("images/07/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.EIGHT:
            resources.load("images/08/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.CLICKEDBOMB:
            resources.load("images/minebombdeath/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          case TYPE.BOMB:
            resources.load("images/minebomb/spriteFrame", SpriteFrame, (err, asset: SpriteFrame) => {
              this._sprite.spriteFrame = asset;
            })
            break;
          default: break;
        }
    }
  
    start() {
      this._sprite = this.getComponent(Sprite)!;
    }
  }