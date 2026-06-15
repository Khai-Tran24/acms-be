import { ContractStatus } from 'src/common/enum/contract.enum';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ unique: true })
  regulationNumber!: string;

  @Column({ unique: true })
  title!: string;

  @Column()
  description!: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  startingPrice!: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  applicationFee!: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  deposit!: string;

  @Column()
  registerStartDate!: Date;

  @Column()
  registerExpiredDate!: Date;

  @Column()
  auctionDate!: Date;

  @Column()
  auctionTime!: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
  })
  status!: ContractStatus;

  @Column({ default: '' })
  fileUrl!: string;

  @ManyToOne(() => User, (user) => user.id)
  auctioneer!: User;

  @ManyToOne(() => User, (user) => user.id)
  secretary!: User;

  @ManyToOne(() => User, (user) => user.id)
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
