class WebSocketManager {
  socket: WebSocket | null;
  messagesQueue: any[]; // Adjust the type according to your message structure
  messageListener: ((event: MessageEvent) => void) | null;
  resolveQueuePromise: ((value?: any) => void) | null;

  constructor() {
    this.socket = null;
    this.messagesQueue = [];
    this.messageListener = null;
    this.resolveQueuePromise = null;
  }

  connect(baseUrl: string, lastSession?: string) {
    let url = `wss://${baseUrl}/.ws?ns=amazing-ripple-221320&v=5`
    if (lastSession !== '') {
      url += `&ls=${lastSession}`;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    this.messageListener = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      this.messagesQueue.push(data); // Push messages to the queue
      if (this.resolveQueuePromise) {
        this.resolveQueuePromise(); // Resolve the promise once messages are pushed
      }
    };

    this.socket.onmessage = this.messageListener;

    this.socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  }

  async waitForMessages() {
    if (!this.resolveQueuePromise) {
      return new Promise((resolve) => {
        this.resolveQueuePromise = resolve;
      });
    }
    return Promise.resolve(); // If already waiting, return a resolved promise
  }

  getNextMessage() {
    return this.messagesQueue.shift(); // Dequeue and return the next message
  }

  flushMessages() {
    this.messagesQueue = []; // Clear the messages queue
    this.resolveQueuePromise = null; // Reset the resolveQueuePromise
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  auth(token: string) {
    if (this.socket) {
      const message = JSON.stringify({
        t: 'd',
        d: {
          a: 'auth',
          r: 2,
          b: {
            cred: token
          }
        }
      });
      this.socket.send(message);
    }
  };

  getFamilyKeyz(userId: string) {
    if (this.socket) {
      const requestData = JSON.stringify({
        t: 'd',
        d: {
          a: 'q',
          r: 4,
          b: {
            p: `userz/${userId}/familyKeyz`,
            h: ''
          }
        }
      });
      this.socket.send(requestData);

    } else {
      console.log('WebSocket connection is not open.');
    }
  };
}

export default WebSocketManager;
