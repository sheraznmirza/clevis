// import { EnvelopeStatus, MediaType } from "src/utilities/enums";
// import {
//   Column,
//   CreateDateColumn,
//   DeleteDateColumn,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   OneToMany,
//   OneToOne,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from "typeorm";

// @Entity()
// export class Media {
//   @Column({ type: "varchar", length: 255, unique: true, nullable: false })
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({
//     type: "enum",
//     enum: MediaType,
//     default: MediaType.FILE,
//   })
//   type: MediaType | string;

//   @Column({ type: "varchar", length: 255, nullable: true })
//   path: string;

//   @CreateDateColumn({ type: "timestamp", nullable: true })
//   created_at: Date;

//   @UpdateDateColumn({ type: "timestamp", nullable: true })
//   updated_at: Date;

//   @DeleteDateColumn({ type: "timestamp", nullable: true })
//   deleted_at: Date;
// }
