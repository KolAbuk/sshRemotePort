export type cbOnOpen = () => void;
export type cbOnClose = (e: Error) => void;
export declare class SshRemotePort {
    private conn;
    private remoteHost;
    private username;
    private password;
    private localForwardPort;
    private remoteForwardPort;
    private sshPort;
    private localForwardHost;
    private remoteForwardHost;
    private keepAliveMs;
    private _stop;
    private _closed;
    constructor({ remoteHost, username, password, sshPort, localForwardHost, remoteForwardHost, remoteForwardPort, localForwardPort, keepAliveMs, }: {
        remoteHost: string;
        username: string;
        password: string;
        sshPort?: string | number;
        localForwardPort?: string | number;
        remoteForwardPort?: string | number;
        localForwardHost?: string;
        remoteForwardHost?: string;
        keepAliveMs?: number;
    });
    private start;
    run: ({ cbOnOpen, cbOnClose, }: {
        cbOnOpen?: cbOnOpen;
        cbOnClose?: cbOnClose;
    }) => Promise<void>;
    close: () => Promise<void>;
}
