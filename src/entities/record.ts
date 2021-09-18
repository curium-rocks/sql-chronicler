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

    @Column({ name: "created_at", readonly: true })
    @CreateDateColumn()
    createdAt!: Date;
    
    @Column({ name: "updated_at" })
    @UpdateDateColumn()
    updatedAt!: Date;
}