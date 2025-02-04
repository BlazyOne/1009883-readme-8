import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { Post, Subscriber } from '@project/shared-core';
import { NotificationsConfig } from '@project/notifications-config';

import {
  EMAIL_ADD_SUBSCRIBER_SUBJECT,
  EMAIL_NOTIFTY_NEW_POSTS_SUBJECT,
} from './mail.constant';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  @Inject(NotificationsConfig.KEY)
  private readonly notificationsConfig: ConfigType<typeof NotificationsConfig>;

  public async sendNotifyNewSubscriber(subscriber: Subscriber) {
    await this.mailerService.sendMail({
      from: this.notificationsConfig.mail.from,
      to: subscriber.email,
      subject: EMAIL_ADD_SUBSCRIBER_SUBJECT,
      template: './add-subscriber',
      context: {
        user: `${subscriber.name}`,
        email: `${subscriber.email}`,
      },
    });
  }

  public async sendNotifyNewPosts(posts: Post[], subscriber: Subscriber) {
    await this.mailerService.sendMail({
      from: this.notificationsConfig.mail.from,
      to: subscriber.email,
      subject: EMAIL_NOTIFTY_NEW_POSTS_SUBJECT,
      template: './new-posts',
      context: {
        subscriber,
        posts,
      },
    });
  }
}
