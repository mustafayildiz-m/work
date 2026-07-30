import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCountryLanguagesTable1785000000000
  implements MigrationInterface
{
  name = 'CreateCountryLanguagesTable1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`country_languages\` (
        \`countryId\` INT NOT NULL,
        \`languageId\` INT NOT NULL,
        \`isPrimary\` TINYINT(1) NOT NULL DEFAULT 0,
        \`displayOrder\` INT NOT NULL DEFAULT 0,
        \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`countryId\`, \`languageId\`),
        INDEX \`IDX_country_languages_country\` (\`countryId\`),
        INDEX \`IDX_country_languages_language\` (\`languageId\`),
        CONSTRAINT \`FK_country_languages_country\`
          FOREIGN KEY (\`countryId\`) REFERENCES \`countries\`(\`id\`)
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_country_languages_language\`
          FOREIGN KEY (\`languageId\`) REFERENCES \`languages\`(\`id\`)
          ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`country_languages\` DROP FOREIGN KEY \`FK_country_languages_language\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`country_languages\` DROP FOREIGN KEY \`FK_country_languages_country\``,
    );
    await queryRunner.query(`DROP TABLE \`country_languages\``);
  }
}
