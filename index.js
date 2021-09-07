const SyslogPro = require('syslog-pro');

exports.main = async (options) => {
    const applicationName = options.applicationName;
    delete options.applicationName;
    const message = options.message;
    delete options.message;
    const severity = options.severity;
    delete options.severity;
    let cef = new SyslogPro.RFC5424(options);
    cef.applacationName = applicationName;
    var methodName;
    switch (severity) {
        case 0:
            methodName = 'emergency';
            break;
        case 1:
            methodName = 'alert';
            break;
        case 2:
            methodName = 'critical';
            break;
        case 3:
            methodName = 'error';
            break;
        case 4:
            methodName = 'warning';
            break;
        case 5:
            methodName = 'notice';
            break;
        case 6:
            methodName = 'informational';
            break;
        case 7:
            methodName = 'debug';
            break;
        default:
            throw new Error("unexpected severity");
    }
    await cef[methodName](message);
};