/* eslint-disable new-cap */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
/**
 * 
 */
export class Record {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("simple-json")
    data: unknown

    @Column({ name: "created_at", readonly: true, default: new Date()})
    createdAt!: Date;
    
    @Column({ name: "updated_at", default: new Date()})
    updatedAt!: Date;
}