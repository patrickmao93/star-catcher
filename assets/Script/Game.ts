const { ccclass, property } = cc._decorator;

export enum BlockTypes {
    Block = 1,
    Star = 2,
    MegaStar = 3,
    Magnet = 4
}

@ccclass
export default class Game extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Prefab)
    BlockPrefab: cc.Prefab = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property
    moveSpeedMultiplyer: number = 1.2;

    @property
    blockSpeedMultiplyer: number = 10;

    @property
    maxBlockSpeed: number = 200;

    @property
    minBlockSpeed: number = 140;

    @property
    magnetChance: number = 0.01;

    @property
    starChance: number = 0.1;

    @property
    megaStarChance: number = 0.1;

    public blockPool = new cc.NodePool();
    private time: number;
    private score = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.registerTouchMove();
        this.time = 1;
        this.score = 0;

        for (let i = 0; i < 100; i++) {
            let block = cc.instantiate(this.BlockPrefab);
            this.blockPool.put(block);
        }

        this.node.on("magnet", e => {
            e.stopPropagation();
            const children = this.node.children;
            children.forEach(child => {
                const component = child.getComponent("Block");
                if (
                    component &&
                    (component.blockType === BlockTypes.Star ||
                        component.blockType === BlockTypes.MegaStar)
                ) {
                    component.attracted = true;
                }
            });
        });

        this.node.on("megaStar", e => {
            e.stopPropagation();
            const children = this.node.children;
            console.log("children", children);
            children.forEach(child => {
                const component = child.getComponent("Block");
                if (component && component.blockType === BlockTypes.Block) {
                    console.log("component", component);
                    component.init(this, BlockTypes.Star);
                }
            });
        });
    }

    start() {}

    update(dt) {
        this.time += dt;

        const roll = Math.random();
        const chance = 0.001 * this.time ** 1.3;
        if (roll < chance) {
            this.spawnBlock(this.getBlockSpawnPosition(), BlockTypes.Block);

            const magnetRoll = Math.random();
            const starRoll = Math.random();
            const megaStarRoll = Math.random();

            if (starRoll < this.starChance) {
                this.spawnBlock(this.getBlockSpawnPosition(), BlockTypes.Star);
            }

            if (magnetRoll < this.magnetChance) {
                this.spawnBlock(this.getBlockSpawnPosition(), BlockTypes.Magnet);
            }

            if (megaStarRoll < this.megaStarChance) {
                this.spawnBlock(this.getBlockSpawnPosition(), BlockTypes.MegaStar);
            }
        }
        this.handlePlayerOutOfbound();
    }

    handlePlayerOutOfbound() {
        const playerX = this.player.position.x;
        const playerY = this.player.position.y;
        const boundries = { x: this.node.width / 2, y: this.node.height / 2 };
        if (playerX < -boundries.x) {
            this.player.setPosition(-boundries.x, playerY);
        }
        if (playerX > boundries.x) {
            this.player.setPosition(boundries.x, playerY);
        }
        if (playerY < -boundries.y) {
            this.player.setPosition(playerX, -boundries.y);
        }
        if (playerY > boundries.y) {
            this.player.setPosition(playerX, boundries.y);
        }
    }

    registerTouchMove = () => {
        this.node.on("touchmove", e => {
            let delta = e.touch.getDelta();
            const playerX = this.player.position.x;
            const playerY = this.player.position.y;

            const newX = playerX + delta.x * this.moveSpeedMultiplyer;
            const newY = playerY + delta.y * this.moveSpeedMultiplyer;
            this.player.setPosition(newX, newY);
        });
    };

    spawnBlock(pos: cc.Vec2, type: BlockTypes) {
        let newBlock;
        if (this.blockPool.size() > 0) {
            newBlock = this.blockPool.get(this);
        } else {
            newBlock = cc.instantiate(this.BlockPrefab);
        }
        newBlock.getComponent("Block").init(this, type);
        const velocity = this.getBlockVelocity();
        newBlock.getComponent("Block").setVelocity(velocity);
        this.node.addChild(newBlock);
        newBlock.setPosition(pos);
    }

    getBlockVelocity(): cc.Vec2 {
        return cc.v2(
            (Math.random() - 0.5) * this.minBlockSpeed,
            -this.minBlockSpeed + (Math.random() - 1) * (this.maxBlockSpeed - this.minBlockSpeed)
        );
    }

    getBlockSpawnPosition(): cc.Vec2 {
        return cc.v2((Math.random() - 0.5) * this.node.width, this.node.height / 2 + 30);
    }

    gameOver() {
        cc.director.pause();
        this.node.off("touchmove");
    }

    gainScore() {
        this.score += 1;
        this.scoreLabel.string = "Score: " + this.score;
    }
}
