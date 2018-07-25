import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Inbox } from "./Inbox";

@Entity()
export class Actor {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  preferredUsername: string;

  @Column()
  publicKeyPem: string;

  @OneToOne(type => Inbox, inbox => inbox.actor)
  inbox: Inbox;

}
