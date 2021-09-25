import { TableForeignKey } from "typeorm";

/**
 * 
 */
export class FKPatch extends TableForeignKey {

    /**
     * Hacky patch
     * @param {string} delim
     * @return {string[]}
     */
    split(delim: string): string[] {
      return [this.referencedTableName]
    }
}