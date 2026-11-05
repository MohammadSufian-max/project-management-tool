import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";

import { Project } from "./Project";
import { Task } from "./Task";

@Entity("employees")
export class Employee {
  @PrimaryColumn({ type: "varchar", length: 50 })
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true, select: false })
password!: string | null;

  @Column({
    type: "varchar",
    length: 100,
    default: "Employee",
  })
  role!: "Super Admin" | "Employee" | "Project Manager";

  @Column({ type: "varchar", length: 20, nullable: true })
  phone!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  designation!: string;

  @Column({
    type: "enum",
    enum: ["Engineering", "Design", "QA", "Business", "Other"],
    nullable: true,
  })
  department!: "Engineering" | "Design" | "QA" | "Business" | "Other";

  @Column({ type: "date", nullable: true })
  joiningDate!: string;

  @Column({
    type: "enum",
    enum: ["Active", "Inactive"],
    default: "Active",
  })
  status!: "Active" | "Inactive";

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  // One employee can manage multiple projects
  @OneToMany(() => Project, (project) => project.projectManager)
  managedProjects!: Project[];

  // One employee can be assigned multiple tasks
  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks!: Task[];
}