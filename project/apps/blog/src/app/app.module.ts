import { Module } from '@nestjs/common';
import { BlogCommentModule } from '@project/blog-comment';
import { BlogPostModule } from '@project/blog-post';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [BlogPostModule, BlogCommentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
