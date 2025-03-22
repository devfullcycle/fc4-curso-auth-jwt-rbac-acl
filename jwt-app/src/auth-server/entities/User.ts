import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import bcrypt from "bcrypt";

export enum Roles {
  Admin = "Admin",
  Teacher = "Teacher",
  Student = "Student"
}

export type Permission = {
  resource: string; //Course
  action: string; //get, update
  condition?: { [key: string]: any }; //{"teacher.user.id": user.id}
  attributes?: string[]; //["description"]
};

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column("simple-array")
  roles: Roles[];

  @Column("json", {nullable: true})
  permissions: Permission[] | null;

  @BeforeInsert()
  //@BeforeUpdate()
  async hashPassword() {
    // Only hash the password if it has been modified
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  comparePassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }

  toJSON(){
    return {
      id: this.id,
      name: this.name,
      email: this.email
    }
  }
}
