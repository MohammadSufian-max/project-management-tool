
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";

import { Project } from "./Project";
import { Employee } from "./Employee";

@Entity("tasks")
export class Task {
  @PrimaryColumn({ type: "varchar", length: 50 })
  id!: string;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  // Project relationship
  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: false,
  })
  project!: Project;

  // Employee relationship
  @ManyToOne(() => Employee, (employee) => employee.assignedTasks, {
    nullable: false,
  })
  assignee!: Employee;

  @Column({
    type: "enum",
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  })
  priority!: "Low" | "Medium" | "High";

  @Column({
    type: "enum",
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  })
  status!: "To Do" | "In Progress" | "Done";

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  dueDate!: string;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;
}
