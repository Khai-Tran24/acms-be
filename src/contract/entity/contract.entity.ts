import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from 'src/common/enum/contract.enum';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ name: 'contract_number', unique: true })
  contractNumber!: string;

  @Column({ name: 'contract_year' })
  contractYear!: number;

  @Column({ name: 'property_name', unique: true })
  propertyName!: string;

  @Column({
    name: 'property_type',
    type: 'enum',
    enum: PropertyType,
  })
  propertyType!: PropertyType;

  @Column({ name: 'property_owner', type: 'jsonb', nullable: true })
  propertyOwner!: {
    name: string;
    phone: string;
  } | null;

  @ManyToOne(() => User, (user) => user.id)
  @JoinTable({ name: 'case_officer' })
  caseOfficer!: User;

  @Column({
    name: 'starting_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  startingPrice!: string;

  @Column({
    name: 'winning_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  winningPrice!: string | null;

  @Column({ name: 'discount_price', type: 'jsonb', nullable: true })
  discountPrice!: { amount: number; times: number } | null;

  @Column({ name: 'end_register_date', type: 'date' })
  endRegisterDate!: string;

  @Column({ name: 'auction_date', type: 'date' })
  auctionDate!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ContractStatus,
  })
  status!: ContractStatus;

  @Column({ name: 'winner', type: 'jsonb', nullable: true })
  winner!: {
    name: string;
    phone: string;
  } | null;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  // @Column()
  // @Column({ default: '' })
  // fileUrl!: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinTable({ name: 'created_by' })
  createdBy!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
