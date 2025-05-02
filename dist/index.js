"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshRemotePort = void 0;
const ssh2_1 = require("ssh2");
const net_1 = __importDefault(require("net"));
class SshRemotePort {
    constructor({ remoteHost, username, password, sshPort, localForwardHost, remoteForwardHost, remoteForwardPort, localForwardPort, keepAliveMs, }) {
        this._stop = false;
        this._closed = false;
        this.start = (cb, cbOnRequest) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.conn.destroy();
                this.conn = new ssh2_1.Client();
                this.conn
                    .on("ready", () => {
                    this._closed = false;
                    this.conn.forwardIn(this.remoteForwardHost, this.remoteForwardPort, (err) => {
                        if (err)
                            throw err;
                        cb ? cb() : null;
                    });
                })
                    .on("tcp connection", (info, accept) => {
                    cbOnRequest ? cbOnRequest(info) : null;
                    const stream = accept();
                    stream.pause();
                    const socket = net_1.default
                        .connect(this.localForwardPort, this.localForwardHost, () => {
                        stream.pipe(socket);
                        socket.pipe(stream);
                        stream.resume();
                    })
                        .on("error", (err) => {
                        throw err;
                    });
                })
                    .on("error", (err) => __awaiter(this, void 0, void 0, function* () {
                    throw err;
                }))
                    .connect({
                    host: this.remoteHost,
                    port: this.sshPort,
                    username: this.username,
                    password: this.password,
                    keepaliveInterval: this.keepAliveMs,
                });
                return new Promise((res, rej) => this.conn.on("close", () => {
                    this._closed = true;
                    rej("Ssh connection closed");
                }));
            }
            catch (e) {
                throw e;
            }
        });
        this.run = (_a) => __awaiter(this, [_a], void 0, function* ({ cbOnOpen, cbOnClose, cbOnRequest, }) {
            while (!this._stop) {
                try {
                    yield this.start(cbOnOpen, cbOnRequest);
                }
                catch (e) {
                    cbOnClose ? cbOnClose(e) : null;
                }
            }
        });
        this.close = () => __awaiter(this, void 0, void 0, function* () {
            try {
                this._stop = true;
                this.conn.destroy();
                while (!this._closed) {
                    yield new Promise((res) => setTimeout(res, 100));
                }
            }
            catch (e) {
                throw e;
            }
        });
        this.remoteHost = remoteHost;
        this.username = username;
        this.password = password;
        this.localForwardHost = localForwardHost || "localhost";
        this.remoteForwardHost = remoteForwardHost || this.localForwardHost;
        this.localForwardPort = Number(localForwardPort) || 80;
        this.remoteForwardPort = Number(remoteForwardPort) || this.localForwardPort;
        this.sshPort = Number(sshPort) || 22;
        this.keepAliveMs = keepAliveMs || 30000;
        this.conn = new ssh2_1.Client();
    }
}
exports.SshRemotePort = SshRemotePort;
