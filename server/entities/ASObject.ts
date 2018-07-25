import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Inbox } from "./Inbox";

@Entity()
export class ASObject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("jsonb")
  asObject: object;

  @ManyToOne(type => Inbox, inbox => inbox.items)
  inbox: Inbox;

}