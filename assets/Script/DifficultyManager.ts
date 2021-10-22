
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DifficultyManager')
export class DifficultyManager extends Component {

    public difficultySelected : number = 0;  //選擇難度

    start () {

    }

}