/* eslint-disable new-cap */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
/**
 * 
 */
export class Record {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column("simple-json")
    data: unknown
}