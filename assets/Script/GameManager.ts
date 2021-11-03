import { _decorator, Component, Node, EventMouse, game, Prefab, instantiate, find, Label, UITransform, Button, director, math } from 'cc';
import { Cell, STATE, TYPE } from "./Cell";
import { DifficultyManager, IGameConfig } from './DifficultyManager';

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
    private _bombLeft!: number;   //炸彈剩餘數量
    private _time!: number;  //計時器   

    private difficultySelect: Node | null = null;  //用來抓取儲存難度資訊用的常駐節點

    private cellsArray: Node[] = [];  //保存每個生成的cell的引用數據

    public row!: number; //列(row) 
    public col!: number; //欄(column) 
    public bombNum!: number; //炸彈總數   
    private cellSpacing!: number; //格子之間的間距
    private cellSize!: number //每個格子的大小
    private spawnPointX!: number  //格子生成點x軸
    private spawnPointY!: number  //格子生成點y軸

    private loadGameConfig!: IGameConfig;

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
        this.backBtn!.node.on(Node.EventType.MOUSE_UP,this.backToMenu,this);  //返回選單按鈕
        
        this.gameConfigLoad();
        this.cellInit();
        this.newGame();
    }

    private backToMenu(){  //返回選單按鈕
        game.removePersistRootNode(this.difficultySelect!); //返回選單的時候移除常駐節點
        director.loadScene("Menu");
}

    private cellScriptGet(cell: Node) {  //取得指定Cell身上的Cell腳本
        return cell.getComponent(Cell)!;
    }

    private gameConfigLoad() {  //取得難度資訊並載入格子屬性
        let difMg: DifficultyManager = this.difficultySelect!.getComponent(DifficultyManager)!
        this.loadGameConfig = difMg.difficultyMap.get(difMg.difficulty);  //取得格子的各種屬性以在接下來套用

        this.cellSpacing = this.loadGameConfig.cellSpacing;
        this.cellSize = this.loadGameConfig.cellSize;
        this.row = this.loadGameConfig.row;
        this.col = this.loadGameConfig.col;
        this.bombNum = this.loadGameConfig.bombNum;
        this.spawnPointX = this.loadGameConfig.spawnPointX;
        this.spawnPointY = this.loadGameConfig.spawnPointY;
    }

    private cellInit() {  //格子產生
        for (let y = 0; y < this.row; y++) {
            for (let x = 0; x < this.col; x++) {
                let cellNode: Node | null = this.spawnCell();

                if (!cellNode){
                    return;
                } 

                this.cellScriptGet(cellNode).tag = (y * this.col) + x;  //此處的tag代表每個生成的格子的編號
                cellNode.getComponent(UITransform)!.setContentSize(this.cellSize, this.cellSize);  //新格子大小設定
                cellNode.setPosition(this.spawnPointX + (this.cellSpacing * x), this.spawnPointY - (this.cellSpacing * y))  //格子定位

                cellNode.on(Node.EventType.MOUSE_UP, (event: EventMouse) => {  //滑鼠事件監聽
                    if (this._gameState != GAME_STATE.PLAY) {
                        return;
                    }

                    if (event.getButton() === EventMouse.BUTTON_LEFT) {  //左鍵點開格子
                        this.onTouchCellBlank(cellNode!);
                    }
                    else if (event.getButton() === EventMouse.BUTTON_RIGHT) {  //右鍵插旗
                        this.onTouchCellFlag(cellNode!);
                    }
                });
                this.cells!.addChild(cellNode);  //產生的格子放進父節點
                this.cellsArray.push(cellNode); 
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
        this.resetGameUI();  //重置UI
        this.resetCells();  //初始化格子
        this.resetMinesSpawn();  //重置地雷
        this.resetMinesAround();  //標記地雷周圍的格子
        this._gameState = GAME_STATE.PLAY;
    }

    private resetGameUI(){  //重置UI
        this.bombLeft = this.bombNum;  //剩餘炸彈數量回歸
        this.time = 0;  //計時器歸零
        this.schedule(this.timeRun, 1); //遊戲計時器開始
        this.gameMessage!.string = "";
    }

    private resetCells(){  //初始化格子
        this.cellsArray.forEach(cell => {
            this.cellScriptGet(cell).type = TYPE.ZERO
            this.cellScriptGet(cell).state = STATE.NONE
        })
    }

    private resetMinesSpawn(){  //隨機生成地雷 並確保地雷不重複選擇同個位置
        let cellsIndex: number[] = [];
        
        this.cellsArray.forEach((cell, index) => {
            cellsIndex[index] = index;            
        })
        
        for (let i = 0; i < this.bombNum; i++) {            
            let n = Math.floor(Math.random() * cellsIndex.length);            
            this.cellScriptGet(this.cellsArray[cellsIndex[n]]).type = TYPE.BOMB
            cellsIndex.splice(n, 1);;  //從此位置刪除一個元素
        }
    }

    private resetMinesAround(){  //標記地雷周圍的格子
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

    private onTouchCellBlank(touchCell: Node) {
        let touchCellScript: Cell = this.cellScriptGet(touchCell);

        if (touchCellScript.state == STATE.FLAG) {
            return;  //無法點擊插旗格
        }

        if (touchCellScript.type == TYPE.BOMB) {  //點到炸彈
            this.gameOver(touchCell);  //遊戲失敗
            return;
        }

        if (touchCellScript.state == STATE.NONE || STATE.DOUBT) {  //點到一般格子或問號
            this.onTouchCellNone(touchCell);
        }
    }

    private onTouchCellNone(touchCell : Node){
        let testCells: Node[] = [];
        testCells.push(touchCell);
        while (testCells.length) {
            let testCell: Node = testCells.pop()!;
            let testCellScript: Cell = this.cellScriptGet(testCell);
            if (testCellScript.type == TYPE.ZERO) { //點開相連的空地
                testCellScript.state = STATE.CLICKED;
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
                testCellScript.state = STATE.CLICKED;
            }
        }
        this.judgeWin();
    }

    private onTouchCellFlag(touchCell: Node) {
        let touchCellScript: Cell = this.cellScriptGet(touchCell);
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
    }

    private judgeWin() {
        let confNum = 0;
        //判斷是否勝利
        this.cellsArray.forEach(cell => {
            if (this.cellScriptGet(cell).state == STATE.CLICKED) {
                confNum++;
            }
        })
        if (confNum == this.cellsArray.length - this.bombNum) { //點開空格數 = 格子總數 - 炸彈總數 時獲勝
            this._gameState = GAME_STATE.WIN;
            this.gameMessage!.string = "You Win！";
            this.reStartGame();
        }
    }

    private gameOver(touchCell: Node) {
        let touchCellScript: Cell = this.cellScriptGet(touchCell);

        touchCellScript.type = TYPE.CLICKEDBOMB;  //被點到的炸彈底色變為紅色
        touchCellScript.state = STATE.CLICKED;

        this.cellsArray.forEach(cell => {  //失敗的時候揭露所有格子
            this.cellScriptGet(cell).state = STATE.CLICKED;
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

