import { WebUsbComInterface } from "./webUsbComInterface";

class WebSerial implements WebUsbComInterface {
  private receiveCallback: ((msg: Uint8Array) => void) | null = null;
  private closeCallback: (() => void) | null = null;
  private errorCallback: ((e: Error) => void) | null = null;

  private port: SerialPort | null = null;
  private writable: WritableStream | null = null;
  private reader: ReadableStreamDefaultReader | null = null;

  private _connected: boolean = false;
  private _readloopRunning: boolean = false;
  get connected() {
    return this._connected;
  }

  constructor(
    private send_chunk: number = 64,
    private send_interval: number = 30
  ) {}

  setReceiveCallback(recvHandler: ((msg: Uint8Array) => void) | null) {
    this.receiveCallback = recvHandler;
  }
  setErrorCallback(handler: (e: Error) => void | null) {
    this.errorCallback = handler;
  }
  setCloseCallback(handler: () => void | null) {
    this.closeCallback = handler;
  }

  async open(
    onConnect: () => void | null,
    param: object = { baudrate: 115200 }
  ) {
    this.port = await navigator.serial.requestPort();

    try {
      await this.port.open({ baudRate: param.baudrate, buffersize: 81920 });
    } catch (e) {
      await this.port.close();
      return Promise.reject(e);
    }

    this._connected = true;
    this._readloopRunning = false;

    if (onConnect) {
      onConnect();
    }

    await this.startReadLoop();

    this.writable = this.port.writable;
    console.log("open serial port");
  }

  private async startReadLoop() {
    this.readLoop();
    await this.sleep(1000);
  }

  private async readLoop() {
    if (this.port == null) {
      console.error("failed to read from serial port");
      return;
    }

    try {
      this.reader = this.port.readable.getReader();
      console.log("start read loop");
      for (;;) {
        const { done, value } = await this.reader.read();

        if (value) {
          // console.log(`serial received: ${value.byteLength}byte`);

          if (this.receiveCallback) {
            this.receiveCallback(value);
          }
        }

        if (done) {
          console.log("Web serial read complete", done);
          if (this.reader) {
            this.reader.releaseLock();
          }

          this._readloopRunning = false;

          break;
        }
      }
    } catch (e) {
      this._readloopRunning = false;
      console.error(e);
      if (this.errorCallback) {
        this.errorCallback(e);
      }

      await this.close();
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve: any) => setTimeout(resolve, ms));
  }

  async writeString(msg: string) {
    await this.write(new TextEncoder().encode(msg));
  }

  async write(msg: Uint8Array) {
    if (this.writable == null) {
      console.error("Serial wrie is unavailable");
      return;
    }

    const writer = this.writable.getWriter();

    for (let index = 0; index < msg.length; index += this.send_chunk) {
      // console.log("serial send:", msg.slice(index, index + this.send_chunk));
      await writer.write(msg.slice(index, index + this.send_chunk));
      await this.sleep(this.send_interval);
    }

    writer.releaseLock();
  }

  async close() {
    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
      } catch (e) {
        console.error(e);
      } finally {
        this.reader = null;
      }
    }

    if (this.writable) {
      // this.writable.abort();
      this.writable = null;
    }

    if (this.closeCallback) {
      this.closeCallback();
    }

    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
        this._connected = false;
      } catch (e) {
        console.error(e);
      }
    }

    console.log("serial port closed");
  }
}

export { WebSerial };
