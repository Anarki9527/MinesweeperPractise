import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

export interface IGameConfig { //格子屬性欄位
    cellSpacing: number;
    cellSize: number;
    row: number;
    col: number;
    bombNum: number;
    spawnPointX: number;
    spawnPointY: number;
}

export enum DIFFICULTY_STATE {  //難度
    NEWBIE = 0, //初級 9*9  10顆地雷  格子大小為40*40 間隔為45
    MEDIUM = 1, //中級 16*16  40顆地雷
    VETERAN = 2 //高級 22*22  99顆地雷
}

@ccclass('DifficultyManager')
export class DifficultyManager extends Component {

    public gameConfig!: IGameConfig;

    private _difficulty!: DIFFICULTY_STATE;

    set difficulty(value: DIFFICULTY_STATE) {  //依照難度不同來設定格子的大小及間距
        this._difficulty = value;
        switch (this._difficulty) {
            case DIFFICULTY_STATE.NEWBIE:
                this.gameConfig = {
                    cellSpacing: 55,
                    cellSize: 50,
                    row: 9,
                    col: 9,
                    bombNum: 10,
                    spawnPointX: -215,
                    spawnPointY: 200
                }
                break;
            case DIFFICULTY_STATE.MEDIUM:
                this.gameConfig = {
                    cellSpacing: 33,
                    cellSize: 30,
                    row: 16,
                    col: 16,
                    bombNum: 40,
                    spawnPointX: -250,
                    spawnPointY: 220
                }
                break;
            case DIFFICULTY_STATE.VETERAN:
                this.gameConfig = {
                    cellSpacing: 24,
                    cellSize: 21,
                    row: 22,
                    col: 22,
                    bombNum: 99,
                    spawnPointX: -245,
                    spawnPointY: 230
                }
                break;
            default:
                break;
        }
    }
    get difficulty() {
        return this._difficulty;
    }

    start() {
        this.difficulty = DIFFICULTY_STATE.NEWBIE  //初始值
    }

}