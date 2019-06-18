// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property
    speed: number = 1000;

    private velocity: cc.Vec2 = cc.v2(0, 1);
    private game = null;

    onLoad() {
        // init velocity based on speed property
        this.velocity = this.velocity.mul(this.speed);

        // init collision
        cc.director.getCollisionManager().enabled = true;
    }

    init(game: cc.Component) {
        this.game = game;
    }

    update(dt) {
        if (this.isBulletOutOfBound()) {
            this.game.recycleBullet(this.node);
            return;
        }

        const newX = this.node.position.x + this.velocity.x * dt;
        const newY = this.node.position.y + this.velocity.y * dt;
        this.node.setPosition(newX, newY);
    }

    isBulletOutOfBound() {
        return this.node.position.y > this.node.parent.height / 2;
    }
}
