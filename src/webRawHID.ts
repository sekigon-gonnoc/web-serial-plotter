import { WebUsbComInterface } from "./webUsbComInterface";

class WebRawHID implements WebUsbComInterface {
  private receiveCallback: ((msg: Uint8Array) => void) | null = null;
  private closeCallback: (() => void) | null = null;
  private errorCallback: ((e: Error) => void) | null = null;

  private port: any | null = null;

  private _connected: boolean = false;
  get connected() {
    return this._connected;
  }

  constructor(
    private send_chunk: number = 64,
    private send_interval: number = 30
  ) {}

  setReceiveCallback(recvHandler: ((msg: Uint8Array) => void) | null) {
    this.receiveCallback = (e: any) => {
      recvHandler(new Uint8Array(e.data.buffer).filter((x) => x != 0));
    };
    this.port.addEventListener("inputreport", this.receiveCallback);
    console.log(this.port);
  }
  setErrorCallback(handler: (e: Error) => void | null) {
    this.errorCallback = handler;
  }
  setCloseCallback(handler: () => void | null) {
    this.closeCallback = handler;
  }

  async open(onConnect: () => void | null, _: object) {
    const request = await navigator.hid.requestDevice({
      filters: [{ usagePage: 0xff31, usage: 0x74 }],
    });
    console.log(request);
    this.port = request[0];

    try {
      await this.port.open();
    } catch (e) {
      await this.port.close();
      return Promise.reject(e);
    }

    this._connected = true;

    if (onConnect) {
      onConnect();
    }

    // this.readLoop();

    console.log("open Raw HID port");
  }

  async writeString(msg: string) {
    throw new Error("Not implemented");
  }

  async write(msg: Uint8Array) {
    throw new Error("Not implemented");
  }

  async close() {
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

    console.log("Raw HID port closed");
  }
}

export { WebRawHID };
