/* eslint-disable new-cap */
import { IDataEmitter } from "@curium.rocks/data-emitter-base";
import { Entity, Column, OneToMany, PrimaryColumn } from "typeorm";
import { EmitterData } from "./emitterData";
import { EmitterStatusHistory } from "./emitterStatusHistory";


@Entity()
/**
 * 
 */
export class Emitter {

    @PrimaryColumn()
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    latitude?: number;

    @Column()
    longitude?: number;

    @Column()
    altitude?: number;

    @OneToMany(() => EmitterData, data => data.emitter)
    data!: EmitterData[];

    @OneToMany(() => EmitterStatusHistory, history => history.emitter)
    history!: EmitterStatusHistory[];

    /**
     * Updates meta information according to what's present on the provided emitter
     * @param {IDataEmitter} dataEmitter 
     */
    updateFromDataEmitter(dataEmitter: IDataEmitter) : void {
        this.name = dataEmitter.name;
        this.description = dataEmitter.description;
    }

    /**
     * 
     * @param {IDataEmitter} dataEmitter 
     * @return {Emitter}
     */
    static createFromDataEmitter(dataEmitter: IDataEmitter) : Emitter {
        const emitter = new Emitter();
        emitter.id = dataEmitter.id;
        emitter.name = dataEmitter.name;
        emitter.description = dataEmitter.description;
        emitter.data = [];
        emitter.history = [];
        return emitter;
    }
}
