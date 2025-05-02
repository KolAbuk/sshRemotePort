import { Client } from "ssh2";
import net from "net";

//

//

export type cbOnOpen = () => void;
export type cbOnClose = (e: Error) => void;
export class SshRemotePort {
  private conn: Client;
  private remoteHost: string;
  private username: string;
  private password: string;
  private localForwardPort: number;
  private remoteForwardPort: number;
  private sshPort: number;
  private localForwardHost: string;
  private remoteForwardHost: string;
  private keepAliveMs: number;
  private _stop: boolean = false;
  private _closed: boolean = false;
  constructor({
    remoteHost,
    username,
    password,
    sshPort,
    localForwardHost,
    remoteForwardHost,
    remoteForwardPort,
    localForwardPort,
    keepAliveMs,
  }: {
    remoteHost: string;
    username: string;
    password: string;
    sshPort?: string | number;
    localForwardPort?: string | number;
    remoteForwardPort?: string | number;
    localForwardHost?: string;
    remoteForwardHost?: string;
    keepAliveMs?: number;
  }) {
    this.remoteHost = remoteHost;
    this.username = username;
    this.password = password;
    this.localForwardHost = localForwardHost || "localhost";
    this.remoteForwardHost = remoteForwardHost || this.localForwardHost;
    this.localForwardPort = Number(localForwardPort) || 80;
    this.remoteForwardPort = Number(remoteForwardPort) || this.localForwardPort;
    this.sshPort = Number(sshPort) || 22;
    this.keepAliveMs = keepAliveMs || 30000;
    this.conn = new Client();
  }

  private start = async (cb?: cbOnOpen): Promise<string> => {
    try {
      this.conn.destroy();
      this.conn = new Client();
      this.conn
        .on("ready", () => {
          this._closed = false;
          this.conn.forwardIn(
            this.remoteForwardHost,
            this.remoteForwardPort,
            (err) => {
              if (err) throw err;
              cb ? cb() : null;
            }
          );
        })
        .on("tcp connection", (info, accept) => {
          const stream = accept();
          stream.pause();
          const socket = net
            .connect(this.localForwardPort, this.localForwardHost, () => {
              stream.pipe(socket);
              socket.pipe(stream);
              stream.resume();
            })
            .on("error", (err: Error) => {
              throw err;
            });
        })
        .on("error", async (err: Error) => {
          throw err;
        })
        .connect({
          host: this.remoteHost,
          port: this.sshPort,
          username: this.username,
          password: this.password,
          keepaliveInterval: this.keepAliveMs,
        });
      return new Promise<string>((res, rej) =>
        this.conn.on("close", () => {
          this._closed = true;
          rej("Ssh connection closed");
        })
      );
    } catch (e: any) {
      throw e;
    }
  };

  run = async ({
    cbOnOpen,
    cbOnClose,
  }: {
    cbOnOpen?: cbOnOpen;
    cbOnClose?: cbOnClose;
  }) => {
    while (!this._stop) {
      try {
        await this.start(cbOnOpen);
      } catch (e: any) {
        cbOnClose ? cbOnClose(e) : null;
      }
    }
  };
  close = async (): Promise<void> => {
    try {
      this._stop = true;
      this.conn.destroy();
      while (!this._closed) {
        await new Promise((res) => setTimeout(res, 100));
      }
    } catch (e) {
      throw e;
    }
  };
}
