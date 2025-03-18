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

  @BeforeInsert()
  @BeforeUpdate()
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
