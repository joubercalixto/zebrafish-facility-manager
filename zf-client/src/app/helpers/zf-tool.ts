// Typescript does not allow enums with values as objects.
// The following is a clever workaround from the internet...
import {ZFTypes} from "../loader.service";

export class ZFTool {
  static readonly SPLASH_LOGIN  = new ZFTool(
    'login',
    ZFTypes.LOGIN,
    'Zebrafish Facility Manager');
  static readonly USER_MANAGER  = new ZFTool(
    'user_admin',
    ZFTypes.USER,
    'User Admin');
  static readonly STOCK_MANAGER  = new ZFTool(
    'stock_manager',
    ZFTypes.STOCK,
    'Stock Manager');
  static readonly MUTATION_MANAGER = new ZFTool(
    'mutation_manager',
    ZFTypes.MUTATION,
    'Mutation Manager');
  static readonly TRANSGENE_MANAGER  = new ZFTool(
    'transgene_manager',
    ZFTypes.TRANSGENE,
    'Transgene Manager');

  // private to disallow creating other instances than the static ones above.
  private constructor(
    public readonly route: string,
    public readonly type: ZFTypes,
    public readonly display_name: any,
  ) {
  }

  // If you talk about a particular tool without specifying an attribute, you get it's route.
  toString() {
    return this.route;
  }
}
