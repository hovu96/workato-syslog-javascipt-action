# workato-syslog-cef-javascipt-action

## Compiling for use in Workato using JavaScript Connector

```
npm install -g browserify
browserify . -o bundle.js --node --im -s index.js
cat bundle.js | pbcopy
```

