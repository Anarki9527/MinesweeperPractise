import { _decorator, Component, Node, ToggleComponent, director, game, Label } from 'cc';
import { DifficultyManager, DIFFICULTY_STATE } from "./DifficultyManager";

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

  private difficultyManager!: DifficultyManager;

  start() {
    game.addPersistRootNode(this.difficultySelect!)  //設置常駐節點
    this.difficultyManager = this.difficultySelect!.getComponent(DifficultyManager)!;

    //主選單
    this.startBtn!.on(Node.EventType.MOUSE_UP, this.showStartPanel, this)
    this.infoBtn!.on(Node.EventType.MOUSE_UP, this.showInfoPanel, this);
  }

  private showStartPanel() {    //難度選擇頁面
    this.selectPanel!.active = true;
    this.infoBtn!.off(Node.EventType.MOUSE_UP, this.showInfoPanel, this);
    this.cancelBtn!.on(Node.EventType.MOUSE_UP, this.closeStartPanel, this);
    this.confirmBtn!.on(Node.EventType.MOUSE_UP, () => { director.loadScene("Game"); }, this);
    this.toggleNewbie!.node.on('toggle', () => { this.difficultyManager.difficulty = DIFFICULTY_STATE.NEWBIE; }, this); //初級
    this.toggleMedium!.node.on('toggle', () => { this.difficultyManager.difficulty = DIFFICULTY_STATE.MEDIUM; }, this); //中級
    this.toggleVeteran!.node.on('toggle', () => { this.difficultyManager.difficulty = DIFFICULTY_STATE.VETERAN; }, this); //高級
  }

  private showInfoPanel() {      //操作說明頁面
    this.infoPanel!.active = true;
    this.ipCancelBtn!.on(Node.EventType.MOUSE_UP, this.closeInfoPanel, this);
  }

  private closeStartPanel(){    //關閉難度選擇頁面
    this.selectPanel!.active = false;
    this.infoBtn!.on(Node.EventType.MOUSE_UP, this.showInfoPanel, this);    
  }

  private closeInfoPanel(){      //關閉操作說明頁面
    this.infoPanel!.active = false;
  }
}