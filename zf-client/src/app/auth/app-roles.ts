export const GUEST_ROLE = 'guest';
export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';

export class AppRoles {
  private static roles: { [name: string]: number } = {
    admin: 3,
    user: 2,
    guest: 1,
  };

  static getRoles(): string[] {
    return Object.keys(this.roles);
  }

  static isAuthorized(userRole: string, permittedRole: string): boolean {
    return (this.roles[userRole] >= this.roles[permittedRole]);
  }
}
