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
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
//
//
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ssh = new _1.SshRemotePort({
            sshPort: 22,
            remoteHost: "193.233.171.72", //"server",
            username: "tunnel", //"root",
            password: "sshTunnelUserPass000", //"pass",
            localForwardHost: "127.0.0.2",
            remoteForwardHost: "localhost",
            localForwardPort: 80,
            remoteForwardPort: 8080,
            keepAliveMs: 10000,
        });
        ssh.run({
            cbOnOpen: () => console.log(new Date().toLocaleString(), "OPEN"),
            cbOnClose: (err) => console.log(new Date().toLocaleString(), `CLOSE, ${err.message}`),
        });
        yield new Promise((res) => setTimeout(res, 30000));
        yield ssh.close();
    }
    catch (e) {
        console.error(e.message);
        console.error(e.stack);
    }
}))();
