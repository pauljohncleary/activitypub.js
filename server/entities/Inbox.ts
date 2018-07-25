import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Actor } from "./Actor";
import { ASObject } from "./ASObject";

@Entity()
export class Inbox {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  summary: string;

  @OneToOne(type => Actor)
  @JoinColumn()
  actor: Actor;

  @OneToMany(type => ASObject, ASObject => ASObject.asObject)
  items: ASObject[];

}
