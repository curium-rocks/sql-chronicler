/* eslint-disable new-cap */
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
/**
 * 
 */
export class Record {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("simple-json")
    data: unknown

    @CreateDateColumn({ name: "created_at", readonly: true })
    createdAt!: Date;
    
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}