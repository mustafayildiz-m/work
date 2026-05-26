import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCountriesTable1780000000000 implements MigrationInterface {
  name = 'CreateCountriesTable1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`countries\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`alpha2\` CHAR(2) NOT NULL,
        \`alpha3\` CHAR(3) NULL,
        \`name\` VARCHAR(120) NOT NULL,
        \`nameTr\` VARCHAR(120) NULL,
        \`flagUrl\` VARCHAR(255) NULL,
        \`primaryLanguageId\` INT NULL,
        \`displayOrder\` INT NOT NULL DEFAULT 0,
        \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`UQ_countries_alpha2\` (\`alpha2\`),
        INDEX \`IDX_countries_primary_language\` (\`primaryLanguageId\`),
        CONSTRAINT \`FK_countries_primary_language\`
          FOREIGN KEY (\`primaryLanguageId\`) REFERENCES \`languages\`(\`id\`)
          ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`countries\` DROP FOREIGN KEY \`FK_countries_primary_language\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_countries_primary_language\` ON \`countries\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_countries_alpha2\` ON \`countries\``,
    );
    await queryRunner.query(`DROP TABLE \`countries\``);
  }
}
