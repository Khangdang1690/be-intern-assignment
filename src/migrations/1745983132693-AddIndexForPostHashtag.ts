import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexForPostHashtag1745983132693 implements MigrationInterface {
    name = 'AddIndexForPostHashtag1745983132693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_31c935be539e76295a7f1c632a" ON "post_hashtags" ("hashtagId") `);
        await queryRunner.query(`CREATE INDEX "IDX_003e77538237089ff217a1cfe7" ON "post_hashtags" ("postId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_003e77538237089ff217a1cfe7"`);
        await queryRunner.query(`DROP INDEX "IDX_31c935be539e76295a7f1c632a"`);
    }

}
