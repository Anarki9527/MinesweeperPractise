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
  BOMB = 9,  //其他炸彈
  CLICKEDBOMB = 10  //被點到的炸彈
}

const imageMap: { [key: string]: string } = {  //讀取對應圖檔用的路徑
  0: "images/00/spriteFrame",
  1: "images/01/spriteFrame",
  2: "images/02/spriteFrame",
  3: "images/03/spriteFrame",
  4: "images/04/spriteFrame",
  5: "images/05/spriteFrame",
  6: "images/06/spriteFrame",
  7: "images/07/spriteFrame",
  8: "images/08/spriteFrame",
  9: "images/minebomb/spriteFrame",
  10: "images/minebombdeath/spriteFrame",
  none: "images/none/spriteFrame",
  flag: "images/mineflagnew/spriteFrame",
  doubt: "images/questioncell/spriteFrame"
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
        resources.load(imageMap["none"], SpriteFrame, (err, asset: SpriteFrame) => { //從resources中載入對應的圖檔，使用imageMap中的路徑
          this._sprite.spriteFrame = asset;
        })
        break;
      case STATE.CLICKED:
        this.showType();
        break;
      case STATE.FLAG:
        resources.load(imageMap["flag"], SpriteFrame, (err, asset: SpriteFrame) => {
          this._sprite.spriteFrame = asset;
        })
        break;
      case STATE.DOUBT:
        resources.load(imageMap["doubt"], SpriteFrame, (err, asset: SpriteFrame) => {
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
    resources.load(imageMap[this.type], SpriteFrame, (err, asset: SpriteFrame) => {
      this._sprite.spriteFrame = asset;
    })
  }

  start() {
    this._sprite = this.getComponent(Sprite)!;
  }
}