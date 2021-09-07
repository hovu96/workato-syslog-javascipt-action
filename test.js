const action = require("./index.js").main;

const input = {
    // https://github.com/cyamato/SyslogPro/blob/master/docs/api.md#module_SyslogPro..RFC5424
    message: "This is the message2",
    applicationName: 'dfdfdf',
    timestamp: true,
    hostname: 'my-host-name',
    severity: 4, // 0-7,
    server: {
        target: 'api.splunk.myworkato.com',
        protocol: "tcp",
        port: 514,
    }
};

function panic(error) {
    console.error(error);
    process.exit(1);
}

action(input).catch(panic).finally(clearInterval.bind(null, setInterval(a => a, 1E9)));
