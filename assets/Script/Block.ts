import { BlockTypes } from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Block extends cc.Component {
    @property(cc.SpriteFrame)
    blockSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    starSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    magnetSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rocketSprite: cc.SpriteFrame = null;

    public blockType = BlockTypes.Block;
    public attracted = false;

    private collisionRadius: number;
    private velocity: cc.Vec2 = cc.v2(0, 0);
    private game = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad() {}

    init(game, type: BlockTypes) {
        this.game = game;

        // init collision
        cc.director.getCollisionManager().enabled = true;

        // init sprite base on type
        switch (type) {
            case 1:
                this.node.getComponent(cc.Sprite).spriteFrame = this.blockSprite;
                this.blockType = BlockTypes.Block;
                break;

            case 2:
                this.node.getComponent(cc.Sprite).spriteFrame = this.starSprite;
                this.blockType = BlockTypes.Star;
                break;

            case 3:
                this.node.getComponent(cc.Sprite).spriteFrame = this.starSprite;
                this.blockType = BlockTypes.MegaStar;
                this.node.width = 50;
                this.node.height = 50;
                break;

            case 4:
                this.node.getComponent(cc.Sprite).spriteFrame = this.magnetSprite;
                this.blockType = BlockTypes.Magnet;
                break;

            case 5:
                this.node.getComponent(cc.Sprite).spriteFrame = this.rocketSprite;
                this.blockType = BlockTypes.Rocket;
                break;

            default:
                break;
        }

        this.collisionRadius = this.node.width;
    }

    update(dt) {
        if (this.isBlockOutOfBound()) {
            this.game.recycleBlock(this.node);
        }
        if (this.attracted) {
            this.setVelocity(
                this.game.player.position
                    .sub(this.node.position)
                    .normalizeSelf()
                    .mul(700)
            );
        }
        const dist = this.getPlayerDistance();
        if (dist < this.collisionRadius) {
            switch (this.blockType) {
                case BlockTypes.Block:
                    console.log("LOST!");
                    this.game.gameOver();
                    break;

                case BlockTypes.Star:
                    this.game.gainScore();
                    this.node.destroy();
                    break;

                case BlockTypes.MegaStar:
                    this.node.dispatchEvent(new cc.Event.EventCustom("megaStar", true));
                    this.node.destroy();
                    break;

                case BlockTypes.Magnet:
                    this.node.dispatchEvent(new cc.Event.EventCustom("magnet", true));
                    this.node.destroy();
                    break;

                case BlockTypes.Rocket:
                    this.node.dispatchEvent(new cc.Event.EventCustom("rocket", true));
                    this.node.destroy();
                    break;

                default:
                    break;
            }
        }
        const newX = this.node.position.x + this.velocity.x * dt;
        const newY = this.node.position.y + this.velocity.y * dt;
        this.node.setPosition(cc.v2(newX, newY));
    }

    setVelocity = (v: cc.Vec2): void => {
        this.velocity = v;
    };

    isBlockOutOfBound(): boolean {
        return (
            Math.abs(this.node.position.x) > this.node.parent.width / 2 + this.node.width / 2 ||
            this.node.position.y < -this.node.parent.height / 2 - this.node.height / 2
        );
    }

    getPlayerDistance() {
        const playerPos = this.game.player.position;
        const dist = this.node.position.sub(playerPos).mag();
        return dist;
    }

    onCollisionEnter(other, self) {
        if (this.blockType === BlockTypes.Block) {
            this.game.recycleBlock(this.node);
        }
    }
}
