import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePapersToIslamicImages1775000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1761939998860-6ccd2ed9198d?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 1",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1761056835725-47bd7658df37?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 2",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1759162323169-f7e380922a2f?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 3",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1710362781451-96f51265b43e?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 4",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1597258071486-bc1754c01349?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 5",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 1",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 2",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 3",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 4",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1400&h=700&q=80' WHERE id = 5",
    );
  }
}
