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
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ name: 'username', unique: true })
  username!: string;

  @Column({ name: 'email', unique: true })
  email!: string;

  @Column({ name: 'password', select: false })
  password!: string;

  @Column({ name: 'is_active', default: false })
  isActive!: boolean;

  @Column({ name: 'role', type: 'enum', enum: Role })
  role!: Role;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken!: string;

  @Column({ name: 'otp_expire_at', nullable: true })
  otpExpireAt?: Date;

  @Column({ name: 'otp', nullable: true })
  otp?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
