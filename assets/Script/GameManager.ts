import { _decorator, Component, Node, EventMouse, game, Prefab, instantiate, find, Label, UITransform, Button, director } from 'cc';
import { CellManager, STATE, TYPE } from "./CellManager";
import { DifficultyManager } from './DifficultyManager';

const { ccclass, property } = _decorator;

enum GAME_STATE {
    PREPARE = 0,
    PLAY = 1,
    DEAD = 2,
    WIN = 3
}

enum TOUCH_STATE {
    BLANK = 0,
    FLAG = 1
}

enum DIFFICULTY_STATE {
    NEWBIE = 0, //初級 9*9  10顆地雷  格子大小為40*40 間隔為45
    MEDIUM = 1, //中級 16*16  40顆地雷
    VETERAN = 2 //高級 22*22  99顆地雷
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public cell: Prefab | null = null;  //格子 每個cell的大小是40*40
    @property({ type: Node })
    public cells: Node | null = null;  //格子節點匯聚
    @property({ type: Label })
    public gameMessage: Label | null = null;  //遊戲目前狀態 
    @property({ type: Node })
    public mask: Node | null = null;  //遊戲結束後的遮罩
    @property({ type: Label })
    public maskLabel: Label | null = null;  //遊戲結束後的遮罩    
    @property({ type: Button })
    public backBtn: Button | null = null;  //返回選單的按鈕   
    @property({ type: Label })
    public bombLeftLabel: Label | null = null;  //炸彈剩餘數量   
    @property({ type: Label })
    public timeLabel: Label | null = null;  //計時器   

    private _gameState: GAME_STATE = GAME_STATE.PREPARE;
    private _touchState!: TOUCH_STATE; //左鍵點開格子、右鍵插旗
    private _difficulty!: DIFFICULTY_STATE;
    private _bombLeft!: number;   //炸彈剩餘數量
    private _time!: number;  //計時器   

    private difficultySelect: Node | null = null;

    private cellsArray: Node[] = [];  //保存每個生成的cell的引用數據

    public row!: number; //列(row) 
    public col!: number; //欄(column) 
    public bombnum!: number; //炸彈總數   
    private cellSpacing!: number; //格子之間的間距
    private cellSize!: number //每個格子的大小
    private spawnPointX!: number  //格子生成點x軸
    private spawnPointY!: number  //格子生成點y軸

    set difficulty(value: DIFFICULTY_STATE) {  //依照難度不同來設定格子的大小及間距
        this._difficulty = value;
        switch (this._difficulty) {
            case DIFFICULTY_STATE.NEWBIE:
                this.cellSpacing = 55;
                this.cellSize = 50;
                this.row = 9;
                this.col = 9;
                this.bombnum = 10
                this.spawnPointX = -215
                this.spawnPointY = 200
                break;
            case DIFFICULTY_STATE.MEDIUM:
                this.cellSpacing = 33;
                this.cellSize = 30;
                this.row = 16;
                this.col = 16;
                this.bombnum = 40
                this.spawnPointX = -250
                this.spawnPointY = 220
                break;
            case DIFFICULTY_STATE.VETERAN:
                this.cellSpacing = 24;
                this.cellSize = 21;
                this.row = 22;
                this.col = 22;
                this.bombnum = 99
                this.spawnPointX = -245
                this.spawnPointY = 230
                break;
            default:
                break;
        }
    }
    get difficulty() {
        return this._difficulty;
    }

    set bombLeft(value) {   //炸彈剩餘數量同步至介面上
        this._bombLeft = value;
        this.bombLeftLabel!.string = value.toString();
    }

    get bombLeft() {
        return this._bombLeft;
    }

    set time(value) {   //計時器同步至介面上
        this._time = value;
        this.timeLabel!.string = value.toString();
    }

    get time() {
        return this._time;
    }

    start() {
        this.difficultySelect = find("DifficultySelect");  //抓常駐節點
        game.removePersistRootNode(this.difficultySelect!)
        this.difficulty = this.difficultySelect!.getComponent(DifficultyManager)!.difficultySelected;  //取得難度資訊
        this.backBtn!.node.on(Node.EventType.MOUSE_UP, () => director.loadScene("Menu"));  //返回選單按鈕
        this.cellInit();
        this.newGame();

    }

    private cellScriptGet(cell: Node) {
        return cell.getComponent(CellManager)!;
    }

    private cellInit() {  //格子產生
        for (let y = 0; y < this.row; y++) {
            for (let x = 0; x < this.col; x++) {
                let cellNode: Node | null = this.spawnCell();

                if (cellNode) {
                    this.cellScriptGet(cellNode).tag = (y * this.col) + x;  //此處的tag代表每個生成的格子的編號
                    cellNode.getComponent(UITransform)!.setContentSize(this.cellSize, this.cellSize);  //新格子大小設定
                    cellNode.setPosition(this.spawnPointX + (this.cellSpacing * x), this.spawnPointY - (this.cellSpacing * y))  //格子定位

                    cellNode.on(Node.EventType.MOUSE_UP, (event: EventMouse) => {  //滑鼠事件監聽
                        if (event.getButton() === EventMouse.BUTTON_LEFT) {  //左鍵點開格子
                            this._touchState = TOUCH_STATE.BLANK;
                        }
                        else if (event.getButton() === EventMouse.BUTTON_RIGHT) {  //右鍵插旗
                            this._touchState = TOUCH_STATE.FLAG;
                        }
                        this.onTouchCell(cellNode!);
                    });

                    this.cells!.addChild(cellNode);  //產生的格子設定父節點
                    this.cellsArray.push(cellNode);
                }
            }
        }
    }

    private spawnCell() {  //實例化格子
        if (!this.cell) {
            return null;
        }

        let cell: Node | null = null;
        cell = instantiate(this.cell);

        return cell;
    }

    private newGame() {  //開始新遊戲
        this.bombLeft = this.bombnum;  //剩餘炸彈數量回歸
        this.time = 0;  //計時器歸零
        this.schedule(this.timeRun, 1); //遊戲計時器開始

        //初始化場景
        this.cellsArray.forEach(cell => {
            this.cellScriptGet(cell).type = TYPE.ZERO
            this.cellScriptGet(cell).state = STATE.NONE
        })
        //隨機生成地雷 確保地雷不重複選擇同個位置
        let cellsIndex: number[] = [];
        this.cellsArray.forEach((cell, index) => {
            cellsIndex[index] = index;
        })
        for (let i = 0; i < this.bombnum; i++) {
            let n = Math.floor(Math.random() * cellsIndex.length);
            this.cellScriptGet(this.cellsArray[n]).type = TYPE.BOMB
            cellsIndex.splice(n, 1);;  //從此位置刪除一個元素
        }
        //標記地雷周圍的格子
        this.cellsArray.forEach(cell => {
            let tempBomb = 0;
            if (this.cellScriptGet(cell).type == TYPE.ZERO) {
                let roundCells: Node[] = this.cellRound(this.cellScriptGet(cell).tag);  //抓出此格子周圍的格子
                roundCells.forEach(rcell => {
                    if (this.cellScriptGet(rcell).type == TYPE.BOMB) {
                        tempBomb++; //格子周圍有Bomb時+1
                    }
                })
                this.cellScriptGet(cell).type = tempBomb;  //此格的type = 周圍炸彈總數
            }
        });
        this._gameState = GAME_STATE.PLAY;
        this.gameMessage!.string = "";
    }

    private cellRound(i: number) {  //取得指定格子周圍的格子 將它們回傳出一個node陣列 
        let roundCells: Node[] = [];
        if (i % this.col > 0) {  //left
            roundCells.push(this.cellsArray[i - 1]);
        }
        if (i % this.col > 0 && Math.floor(i / this.col) > 0) {  //left top
            roundCells.push(this.cellsArray[i - this.col - 1]);
        }
        if (i % this.col > 0 && Math.floor(i / this.col) < this.row - 1) {  //left bottom
            roundCells.push(this.cellsArray[i + this.col - 1]);
        }
        if (Math.floor(i / this.col) > 0) {  //top
            roundCells.push(this.cellsArray[i - this.col]);
        }
        if (Math.floor(i / this.col) < this.row - 1) {  //bottom
            roundCells.push(this.cellsArray[i + this.col]);
        }
        if (i % this.col < this.col - 1) {  //right
            roundCells.push(this.cellsArray[i + 1]);
        }
        if (i % this.col < this.col - 1 && Math.floor(i / this.col) > 0) {  //right top
            roundCells.push(this.cellsArray[i - this.col + 1]);
        }
        if (i % this.col < this.col - 1 && Math.floor(i / this.col) < this.row - 1) {  //right bottom
            roundCells.push(this.cellsArray[i + this.col + 1]);
        }
        return roundCells;
    }

    private onTouchCell(touchCell: Node) {
        if (this._gameState != GAME_STATE.PLAY) {
            return;
        }
        let touchCellScript: CellManager = this.cellScriptGet(touchCell);
        switch (this._touchState) {
            case TOUCH_STATE.FLAG:  //右鍵插旗、問號或取消插旗               
                switch (touchCellScript.state) {
                    case STATE.NONE:  //順序：空格>插旗>問號>空格 ...
                        if (this.bombLeft == 0) {   //插旗格數量不得超過炸彈總數
                            touchCellScript.state = STATE.DOUBT  //超過炸彈總數後只會擺放問號
                            return;
                        }
                        touchCellScript.state = STATE.FLAG;
                        this.bombLeft -= 1;
                        break;
                    case STATE.FLAG:
                        touchCellScript.state = STATE.DOUBT
                        this.bombLeft += 1;
                        break;
                    case STATE.DOUBT:
                        touchCellScript.state = STATE.NONE
                        break;
                    default:
                        break;
                }
                break;
            case TOUCH_STATE.BLANK:  //左鍵點擊格子
                if (touchCellScript.state == STATE.FLAG) {
                    return;  //無法點擊插旗格
                }
                if (touchCellScript.type == TYPE.BOMB) {  //點到炸彈
                    touchCellScript.type = TYPE.CLICKEDBOMB;  //被點到的炸彈底色變為紅色
                    touchCellScript.state = STATE.CLIKED;
                    this.gameOver();
                    return;
                }
                let testCells: Node[] = [];
                if (touchCellScript.state == STATE.NONE || STATE.DOUBT) {  //點到一般格子或問號
                    testCells.push(touchCell);
                    while (testCells.length) {
                        let testCell: Node = testCells.pop()!;
                        let testCellScript: CellManager = this.cellScriptGet(testCell);
                        if (testCellScript.type == TYPE.ZERO) { //點開相連的空地
                            testCellScript.state = STATE.CLIKED;
                            let roundCells = this.cellRound(testCellScript.tag); //檢查周圍格子
                            roundCells.forEach(cell => {
                                if (this.cellScriptGet(cell).state == STATE.NONE) {
                                    testCells.push(cell);  //將附近的空地也放進去一並檢查
                                }
                                if (this.cellScriptGet(cell).state == STATE.DOUBT) {
                                    testCells.push(cell);  //將問號也放進去一並檢查
                                }
                            })
                        }
                        else if (testCellScript.type > TYPE.ZERO && testCellScript.type < TYPE.BOMB) {
                            testCellScript.state = STATE.CLIKED;
                        }
                    }
                    this.judgeWin();
                }
                break;
            default: break;
        }
    }

    private judgeWin() {
        let confNum = 0;
        //判斷是否勝利
        this.cellsArray.forEach(cell => {
            if (this.cellScriptGet(cell).state == STATE.CLIKED) {
                confNum++;
            }
        })
        if (confNum == this.cellsArray.length - this.bombnum) { //點開空格數 = 格子總數 - 炸彈總數 時獲勝
            this._gameState = GAME_STATE.WIN;
            this.gameMessage!.string = "You Win！";
            this.reStartGame();
        }
    }

    private gameOver() {
        this.cellsArray.forEach(cell => {  //失敗的時候揭露所有格子
            this.cellScriptGet(cell).state = STATE.CLIKED;
        })

        this._gameState = GAME_STATE.DEAD;
        this.gameMessage!.string = "You Lose！";
        this.reStartGame();
    }

    private reStartGame() { //重新開始
        this.mask!.active = true;  //讓畫面變暗的遮罩
        this.unschedule(this.timeRun);  //結束計時器
        this.scheduleOnce(this.maskClicked, 2)  //兩秒後啟動
    }

    private maskClicked() {
        this.maskLabel!.string = "點擊任意處重新開始"
        this.mask!.on(Node.EventType.MOUSE_UP, () => {
            this.newGame();
            this.maskLabel!.string = ""
            this.mask!.active = false;
            this.mask!.off(Node.EventType.MOUSE_UP) //關閉mask的滑鼠事件監聽    
        });
    }

    private timeRun() {  //計時器運行
        this.time += 1;
    }
}

