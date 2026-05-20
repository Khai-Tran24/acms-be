import { Role } from 'src/common/enum/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ nullable: true })
  refreshToken!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'enum', enum: Role })
  role!: Role;

  @Column({ nullable: true })
  otpExpireAt?: Date;

  @Column({ nullable: true })
  otp?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
