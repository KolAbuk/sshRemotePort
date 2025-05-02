import { SshRemotePort } from ".";

//

//

(async () => {
  try {
    const ssh = new SshRemotePort({
      sshPort: 22,
      remoteHost: "server",
      username: "root",
      password: "pass",
      localForwardHost: "127.0.0.2",
      remoteForwardHost: "localhost",
      localForwardPort: 80,
      remoteForwardPort: 80,
      keepAliveMs: 10000,
    });
    ssh.run({
      cbOnOpen: () => console.log(new Date().toLocaleString(), "OPEN"),
      cbOnClose: (err) =>
        console.log(new Date().toLocaleString(), `CLOSE, ${err.message}`),
    });
    await new Promise((res) => setTimeout(res, 30000));
    await ssh.close();
  } catch (e: any) {
    console.error(e.message);
    console.error(e.stack);
  }
})();
