import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserPostShareTable1759538264000
  implements MigrationInterface
{
  name = 'CreateUserPostShareTable1759538264000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('user_post_shares');

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'user_post_shares',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'user_id',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'post_id',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'post_type',
              type: 'varchar',
              length: '50',
              isNullable: false,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              isNullable: false,
            },
          ],
        }),
        true,
      );
    } else {
      // Table exists, check if post_type column exists
      const table = await queryRunner.getTable('user_post_shares');
      if (!table?.findColumnByName('post_type')) {
        await queryRunner.query(`
                    ALTER TABLE \`user_post_shares\` 
                    ADD COLUMN \`post_type\` varchar(50) NOT NULL DEFAULT 'user_post'
                `);
      }
    }

    // Unique constraint - bir kullanıcı aynı gönderiyi sadece bir kez paylaşabilir
    // Check if index already exists
    try {
      await queryRunner.query(`
                CREATE UNIQUE INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`, \`post_type\`)
            `);
    } catch (error) {
      // Index might already exist, check if it's for different columns
      const table = await queryRunner.getTable('user_post_shares');
      const hasPostType = table?.findColumnByName('post_type');
      if (hasPostType) {
        // Try to drop existing index if it exists with different columns
        try {
          await queryRunner.query(
            `DROP INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\``,
          );
          await queryRunner.query(`
                        CREATE UNIQUE INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`, \`post_type\`)
                    `);
        } catch (err) {
          console.log('Index already exists or error creating index:', err);
        }
      } else {
        // If post_type doesn't exist, create index without it
        try {
          await queryRunner.query(`
                        CREATE UNIQUE INDEX \`IDX_user_post_share_unique\` ON \`user_post_shares\` (\`user_id\`, \`post_id\`)
                    `);
        } catch (err) {
          console.log('Could not create index:', err);
        }
      }
    }

    // Foreign key constraint - sadece user_id için
    await queryRunner.query(`
            ALTER TABLE \`user_post_shares\` 
            ADD CONSTRAINT \`FK_user_post_share_user\` 
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    // post_id için foreign key yok çünkü farklı tablolara referans verebilir (user_posts veya scholar_posts)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_post_shares');
  }
}
