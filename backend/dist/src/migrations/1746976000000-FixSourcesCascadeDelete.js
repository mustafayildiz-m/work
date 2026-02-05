"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixSourcesCascadeDelete1746976000000 = void 0;
class FixSourcesCascadeDelete1746976000000 {
    constructor() {
        this.name = 'FixSourcesCascadeDelete1746976000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`);
        await queryRunner.query(`ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`);
        await queryRunner.query(`ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id)`);
    }
}
exports.FixSourcesCascadeDelete1746976000000 = FixSourcesCascadeDelete1746976000000;
//# sourceMappingURL=1746976000000-FixSourcesCascadeDelete.js.map