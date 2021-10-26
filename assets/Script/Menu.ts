import { _decorator, Component, Node, ToggleComponent, director,  game } from 'cc';
import { DifficultyManager , DIFFICULTY_STATE } from "./DifficultyManager";

const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    @property({ type: Node })
    public difficultySelect: Node | null = null;  //傳遞難度資料用的常駐節點
    @property({ type: Node })
    public startBtn: Node | null = null;
    @property({ type: Node })
    public selectPanel: Node | null = null;
    @property({ type: Node })
    public cancelBtn: Node | null = null;
    @property({ type: Node })
    public confirmBtn: Node | null = null;
    @property({ type: Node })
    public infoBtn: Node | null = null;
    @property({ type: Node })
    public infoPanel: Node | null = null;
    @property({ type: Node })
    public ipCancelBtn: Node | null = null;

    @property({ type: ToggleComponent })
    public toggleNewbie: ToggleComponent | null = null;
    @property({ type: ToggleComponent })
    public toggleMedium: ToggleComponent | null = null;
    @property({ type: ToggleComponent })
    public toggleVeteran: ToggleComponent | null = null;

    start() {
        game.addPersistRootNode(this.difficultySelect!)  //設置常駐節點
        let difficultyManager = this.difficultySelect!.getComponent(DifficultyManager)!;

        //主選單
        this.startBtn!.on(Node.EventType.MOUSE_UP, () => { this.selectPanel!.active = true; }, this);
        this.infoBtn!.on(Node.EventType.MOUSE_UP, () => { this.infoPanel!.active = true; }, this);

        //難度選擇頁面
        this.cancelBtn!.on(Node.EventType.MOUSE_UP, () => { this.selectPanel!.active = false; }, this);
        this.confirmBtn!.on(Node.EventType.MOUSE_UP, () => { director.loadScene("Game"); }, this);
        this.toggleNewbie!.node.on('toggle', () => { difficultyManager.difficulty = DIFFICULTY_STATE.NEWBIE; }, this); //初級
        this.toggleMedium!.node.on('toggle', () => { difficultyManager.difficulty = DIFFICULTY_STATE.MEDIUM; }, this); //中級
        this.toggleVeteran!.node.on('toggle', () => { difficultyManager.difficulty = DIFFICULTY_STATE.VETERAN; }, this); //高級

        //操作說明頁面
        this.ipCancelBtn!.on(Node.EventType.MOUSE_UP, () => { this.infoPanel!.active = false; }, this);
    }
}