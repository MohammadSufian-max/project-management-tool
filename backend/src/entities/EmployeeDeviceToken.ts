
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";

import { Employee } from "./Employee";

@Entity("employee_device_tokens")
@Index(["token"], { unique: true })
export class EmployeeDeviceToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 512 })
  token!: string;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  employee!: Employee;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;
}
