import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSourcesCascadeDelete1746976000000
  implements MigrationInterface
{
  name = 'FixSourcesCascadeDelete1746976000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`,
    );
    await queryRunner.query(
      `ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sources DROP FOREIGN KEY FK_0e57eac098d35f453f611e6374b`,
    );
    await queryRunner.query(
      `ALTER TABLE sources ADD CONSTRAINT FK_0e57eac098d35f453f611e6374b FOREIGN KEY (scholar_id) REFERENCES scholars(id)`,
    );
  }
}
