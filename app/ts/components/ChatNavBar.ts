import {Component, OnInit} from '@angular/core';
import {MessagesService, ThreadsService} from '../services/services';
import {Message, Thread} from '../models';

@Component({
  selector: 'nav-bar',
  template: `
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="https://ng-book.com/2">
          <img src="${require('images/logos/ng-book-2-minibook.png')}"/>
           ng-book 2
        </a>
      </div>
      <p class="navbar-text navbar-right">
        <button class="btn btn-primary" type="button">
          Messages <span class="badge">{{unreadMessagesCount}}</span>
        </button>
      </p>
    </div>
  </nav>
  `
})
export class ChatNavBar implements OnInit
{
  unreadMessagesCount: number;

  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService)
  { }

  ngOnInit(): void
  {
    this.messagesService.messages
      .combineLatest(this.threadsService.currentThread)
      .subscribe(this.messageReceived.bind(this));
  }

  messageReceived([messages, currentThread]: [Message[], Thread]): void
  {
    this.unreadMessagesCount = messages
      .filter(isNotRead)
      .reduce((sum: number): number => sum + 1, 0);

    function isNotRead(message: Message): boolean
    {
      let messageIsInCurrentThread: boolean = message.thread && currentThread && (currentThread.id === message.thread.id);
      return !message.isRead && !messageIsInCurrentThread;
    }
  }
}

