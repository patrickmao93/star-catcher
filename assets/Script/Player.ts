const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Prefab)
    BulletPrefab: cc.Prefab = null;

    private game = null;
    private bulletPool: cc.NodePool = new cc.NodePool();
    private fireTimer = 0;

    onLoad() {
        for (let i = 0; i < 30; i++) {
            const newBullet = cc.instantiate(this.BulletPrefab);
            newBullet.getComponent("Bullet").init(this);
            this.bulletPool.put(newBullet);
        }
    }

    update() {}

    init(game) {
        this.game = game;
    }

    startFiring = () => {
        if (this.fireTimer > 0) {
            this.fireTimer = 0;
            return;
        }
        const fire = setInterval(() => {
            const bullet = this.bulletPool.get();
            const bulletPos = cc.v2(
                this.node.position.x,
                this.node.position.y + this.node.height / 2
            );
            bullet.setPosition(bulletPos);
            this.game.node.addChild(bullet);
            this.fireTimer += 0.1;
            if (this.fireTimer >= this.game.fireDuration) {
                this.fireTimer = 0;
                clearInterval(fire);
            }
        }, 100);
    };

    recycleBullet = (bullet: cc.Node) => {
        this.bulletPool.put(bullet);
    };
}
