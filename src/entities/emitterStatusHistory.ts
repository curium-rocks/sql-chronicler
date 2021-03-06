/* eslint-disable new-cap */
import { IStatusEvent } from "@curium.rocks/data-emitter-base";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Emitter } from "./emitter";

@Entity()
/**
 * 
 */
export class EmitterStatusHistory {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Emitter, emitter => emitter.history)
    emitter!: Emitter;

    @Column()
    emitterId!: string;

    @Column()
    connected!: boolean;

    @Column()
    bit!: boolean;

    @Column()
    timestamp!: Date;

    @CreateDateColumn({ name: "created_at", readonly: true })
    createdAt!: Date;
    
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    /**
     * 
     * @param {IStatusEvent} evt
     * @return {EmitterStatusHistory} 
     */
    static createFromStatusEvent(evt: IStatusEvent) : EmitterStatusHistory {
        const statusItem = new EmitterStatusHistory();
        statusItem.bit = evt.bit;
        statusItem.connected = evt.connected;
        statusItem.timestamp = evt.timestamp;
        statusItem.emitterId = evt.emitter.id;
        return statusItem;

    }
}