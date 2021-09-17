/* eslint-disable new-cap */
import { IDataEvent } from "@curium.rocks/data-emitter-base";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Emitter } from "./emitter";


@Entity()
/**
 * 
 */
export class EmitterData {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Emitter, emitter => emitter.data)
    emitter!: Emitter;

    @Column()
    emitterId!: string;

    @Column()
    timestamp!: Date;

    @Column("simple-json")
    meta: unknown;

    @Column("simple-json")
    data: unknown

    /**
     * 
     * @param {IDataEvent} evt 
     * @return {EmitterData} 
     */
    static createFromDataEvent(evt: IDataEvent) : EmitterData {
        const emitterData = new EmitterData();
        emitterData.emitterId = evt.emitter.id;
        emitterData.data = evt.data;
        emitterData.meta = evt.meta;
        emitterData.timestamp = evt.timestamp;
        return emitterData;
    }
}