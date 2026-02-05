import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1768778615610 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // User Posts için indexler
    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_posts_user_id_status_created 
                ON user_posts(user_id, status, created_at)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_posts_status_created 
                ON user_posts(status, created_at)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    // User Follow için indexler
    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_follow_follower 
                ON user_follow(follower_id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_follow_following 
                ON user_follow(following_id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    // User Scholar Follow için indexler
    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_scholar_follow_user 
                ON user_scholar_follow(user_id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_scholar_follow_scholar 
                ON user_scholar_follow(scholar_id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    // User Post Comments için indexler
    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_post_comments_post 
                ON user_post_comments(post_id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_post_comments_user 
                ON user_post_comments(user_id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    // User Post Shares için indexler
    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_post_share_user_created 
                ON user_post_share(user_id, created_at)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    try {
      await queryRunner.query(`
                CREATE INDEX idx_user_post_share_post_type 
                ON user_post_share(post_id, post_type)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    // Scholar Posts için indexler
    try {
      await queryRunner.query(`
                CREATE INDEX idx_scholar_posts_scholar_created 
                ON scholar_posts(scholarId, createdAt)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }

    // Users için index
    try {
      await queryRunner.query(`
                CREATE INDEX idx_users_active 
                ON users(isActive, id)
            `);
    } catch (e) {
      // Index zaten varsa devam et
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Indexleri geri al
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_posts_user_id_status_created ON user_posts`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_posts_status_created ON user_posts`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_follow_follower ON user_follow`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_follow_following ON user_follow`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_scholar_follow_user ON user_scholar_follow`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_scholar_follow_scholar ON user_scholar_follow`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_post_comments_post ON user_post_comments`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_post_comments_user ON user_post_comments`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_post_share_user_created ON user_post_share`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_user_post_share_post_type ON user_post_share`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `DROP INDEX idx_scholar_posts_scholar_created ON scholar_posts`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(`DROP INDEX idx_users_active ON users`);
    } catch (e) {}
  }
}
