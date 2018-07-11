import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Actor {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  preferredUsername: string;

  @Column()
  publicKeyPem: string;

}
