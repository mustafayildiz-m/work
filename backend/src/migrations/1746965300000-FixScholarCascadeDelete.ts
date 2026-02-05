import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixScholarCascadeDelete1746965300000
  implements MigrationInterface
{
  name = 'FixScholarCascadeDelete1746965300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // sources tablosu
    await queryRunner.query(
      `ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`,
    );
    await queryRunner.query(
      `ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`,
    );

    // scholar_own_books tablosu
    await queryRunner.query(
      `ALTER TABLE scholar_own_books DROP FOREIGN KEY FK_d08cc9436cf4a9d299c21ebc417`,
    );
    await queryRunner.query(
      `ALTER TABLE scholar_own_books ADD CONSTRAINT FK_d08cc9436cf4a9d299c21ebc417 FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`,
    );

    // scholar_related_books tablosu
    await queryRunner.query(
      `ALTER TABLE scholar_related_books DROP FOREIGN KEY FK_4441e00d0375beae4274df51bb7`,
    );
    await queryRunner.query(
      `ALTER TABLE scholar_related_books ADD CONSTRAINT FK_4441e00d0375beae4274df51bb7 FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // sources tablosu
    await queryRunner.query(
      `ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`,
    );
    await queryRunner.query(
      `ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id)`,
    );

    // scholar_own_books tablosu
    await queryRunner.query(
      `ALTER TABLE scholar_own_books DROP FOREIGN KEY FK_d08cc9436cf4a9d299c21ebc417`,
    );
    await queryRunner.query(
      `ALTER TABLE scholar_own_books ADD CONSTRAINT FK_d08cc9436cf4a9d299c21ebc417 FOREIGN KEY (scholar_id) REFERENCES scholars(id)`,
    );

    // scholar_related_books tablosu
    await queryRunner.query(
      `ALTER TABLE scholar_related_books DROP FOREIGN KEY FK_4441e00d0375beae4274df51bb7`,
    );
    await queryRunner.query(
      `ALTER TABLE scholar_related_books ADD CONSTRAINT FK_4441e00d0375beae4274df51bb7 FOREIGN KEY (scholar_id) REFERENCES scholars(id)`,
    );
  }
}
