// TODO: Use a configurable remote/local storage

const db = {
  users: [
    {
      id: 'JohnTheDoe',
      email: 'john@doe.com',
      password: 'doe',
      firstName: 'John',
      lastName: 'Doe',
    },
  ],
};

export class Account {
  static async findAccount(ctx: any, id: string) {
    const users = db.users.filter((u) => u.id === id);
    if (users.length === 0) return undefined;
    const user = users[0];
    const { email, firstName, lastName } = user;
    return {
      accountId: id,
      claims: async () => ({
        sub: id,
        email,
        firstName,
        lastName,
      }),
    };
  }

  static async authenticate(email: string, password: string) {
    const users = db.users.filter((u) => u.email === email && u.password === password);
    if (users.length === 0) return undefined;
    const user = users[0];
    const { id } = user;
    return id;
  }
}
