"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixScholarCascadeDelete1746965300000 = void 0;
class FixScholarCascadeDelete1746965300000 {
    constructor() {
        this.name = 'FixScholarCascadeDelete1746965300000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`);
        await queryRunner.query(`ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE scholar_own_books DROP FOREIGN KEY FK_d08cc9436cf4a9d299c21ebc417`);
        await queryRunner.query(`ALTER TABLE scholar_own_books ADD CONSTRAINT FK_d08cc9436cf4a9d299c21ebc417 FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE scholar_related_books DROP FOREIGN KEY FK_4441e00d0375beae4274df51bb7`);
        await queryRunner.query(`ALTER TABLE scholar_related_books ADD CONSTRAINT FK_4441e00d0375beae4274df51bb7 FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`);
        await queryRunner.query(`ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id)`);
        await queryRunner.query(`ALTER TABLE scholar_own_books DROP FOREIGN KEY FK_d08cc9436cf4a9d299c21ebc417`);
        await queryRunner.query(`ALTER TABLE scholar_own_books ADD CONSTRAINT FK_d08cc9436cf4a9d299c21ebc417 FOREIGN KEY (scholar_id) REFERENCES scholars(id)`);
        await queryRunner.query(`ALTER TABLE scholar_related_books DROP FOREIGN KEY FK_4441e00d0375beae4274df51bb7`);
        await queryRunner.query(`ALTER TABLE scholar_related_books ADD CONSTRAINT FK_4441e00d0375beae4274df51bb7 FOREIGN KEY (scholar_id) REFERENCES scholars(id)`);
    }
}
exports.FixScholarCascadeDelete1746965300000 = FixScholarCascadeDelete1746965300000;
//# sourceMappingURL=1746965300000-FixScholarCascadeDelete.js.map