
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { Employee } from "../entities/Employee";
import { Project } from "../entities/Project";
import { Task } from "../entities/Task";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [Employee, Project, Task],

  synchronize: true,
  logging: true,
});
