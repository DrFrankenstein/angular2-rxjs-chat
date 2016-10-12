import {Injectable} from '@angular/core';
import {Subject, BehaviorSubject, Observable} from 'rxjs';
import {Thread, Message} from '../models';
import {MessagesService} from './MessagesService';
import * as _ from 'underscore';

interface ThreadMap
{
  [key: string]: Thread;
}

@Injectable()
export class ThreadsService
{

  // `threads` is a observable that contains the most up to date list of threads
  threads: Observable<ThreadMap>;

  // `orderedThreads` contains a newest-first chronological list of threads
  orderedThreads: Observable<Thread[]>;

  // `currentThread` contains the currently selected thread
  currentThread: Subject<Thread> = new BehaviorSubject<Thread>(new Thread());

  // `currentThreadMessages` contains the set of messages for the currently
  // selected thread
  currentThreadMessages: Observable<Message[]>;

  constructor(public messagesService: MessagesService)
  {
    this.threads = messagesService.messages.map(ThreadsService.updateThreads);
    this.orderedThreads = this.threads.map(ThreadsService.orderThreads);
    this.currentThreadMessages = this.currentThread.combineLatest(messagesService.messages, ThreadsService.messagesForThread);

    this.currentThread.subscribe(this.messagesService.markThreadAsRead);
  }

  setCurrentThread(newThread: Thread): void
  {
    this.currentThread.next(newThread);
  }

  private static updateThreads(messages: Message[]): ThreadMap
  {
    let threads: ThreadMap = {};
    // Store the message's thread in our accumulator `threads`
    messages.forEach((message: Message): void => {
      let thread: Thread = message.thread;
      threads[message.thread.id] = threads[message.thread.id] || thread;

      // Cache the most recent message for each thread
      if (!thread.lastMessage || thread.lastMessage.sentAt < message.sentAt)
        thread.lastMessage = message;
    });
    return threads;
  }

  private static orderThreads(threadGroups: ThreadMap): Thread[]
  {
    let threads: Thread[] = _.values(threadGroups);
    return _.sortBy(threads, (t: Thread) => -t.lastMessage.sentAt);
  }

  private static messagesForThread(thread: Thread, allMessages: Message[]): Message[]
  {
    if (!thread || !allMessages.length)
      return [];

    return _.chain(allMessages)
        .filter((message: Message) => (message.thread.id === thread.id))
        .each((message: Message) => message.isRead = true)
        .value();
  }
}

export var threadsServiceInjectables: Array<any> = [
  ThreadsService
];
