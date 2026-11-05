
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";

import { Employee } from "./Employee";
import { Task } from "./Task";

@Entity("projects")
export class Project {
  @PrimaryColumn({ type: "varchar", length: 50 })
  id!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  // Project Manager relationship
  @ManyToOne(() => Employee, (employee) => employee.managedProjects, {
    nullable: false,
  })
  projectManager!: Employee;

  // Project team members relationship
  @ManyToMany(() => Employee)
  @JoinTable({
    name: "project_team_members",
    joinColumn: {
      name: "projectId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "employeeId",
      referencedColumnName: "id",
    },
  })
  teamMembers!: Employee[];

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  endDate!: string;

  @Column({
    type: "enum",
    enum: ["Planned", "In Progress", "On Hold", "Completed"],
    default: "Planned",
  })
  status!: "Planned" | "In Progress" | "On Hold" | "Completed";

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @Column({ type: "boolean", default: false })
  isArchived!: boolean;

  // One project can have multiple tasks
  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}
