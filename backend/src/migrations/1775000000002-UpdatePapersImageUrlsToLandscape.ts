import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePapersImageUrlsToLandscape1775000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&q=80' WHERE id = 1",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1400&q=80' WHERE id = 2",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80' WHERE id = 3",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&q=80' WHERE id = 4",
    );
    await queryRunner.query(
      "UPDATE papers SET imageUrl = 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1400&q=80' WHERE id = 5",
    );
  }
}
