//models/Tenant

class Tenant {
  id!: number;
  name!: string;
  username!: string;
  password!: string;
  description?: string;
  role!: string;

  constructor(
    id: number,
    name: string,
    username: string,
    password: string,
    role: string,
    description?: string
  ) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.password = password;
    this.role = role;
    this.description = description;
  }
}

export { Tenant };
