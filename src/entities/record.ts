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
}