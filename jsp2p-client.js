/* Copyright (C) 2015 Legrand France
 * All rights reserved
 *
 * JS library to deal with Legrand P2P servers (XMPP)
 */
'use strict';

var STATUS = {
    AWAY: "away",
    DND: "dnd",
    XA: "xa",
    ONLINE: "online",
    OFFLINE: "offline"
};

var nxmlpp = require('nxmlpp');
var xmpp = require('simple-xmpp');
var argv = process.argv;
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/cheese.log', category: 'cheese' }
  ]
});
var logger = log4js.getLogger('jsp2p');
logger.setLevel('DEBUG');

function ConnectioInfo() {
    this.jid = argv[2];
    this.pwd = argv[3];
    this.host = argv[4];
    this.port = 5222;
}

var connInfo = new ConnectioInfo();

if (argv.length < 5) {
    logger.error('Usage: node jsp2p-client.js <myjid> ' +
        '<mypassword> <host>');
    process.exit(1);
}

xmpp.on('online', function(data) {
    logger.info('Connected with JID:', data.jid.user);
});

xmpp.on('error', function(err) {
    logger.error(err);
});

xmpp.on('stanza', function(stanza) {
    logger.debug('Incoming stanza:', nxmlpp.strPrint(stanza.toString()));
    if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.attrs.id === 'roster_0') {
        var buddies = stanza.children[0].children;
        logger.debug("buddies:", buddies);
    }
});

process.on('SIGINT', function() {
    logger.debug("\nCaught ctrl+c");
    logger.debug("Disconnecting...");
    xmpp.disconnect();
    logger.info("Exiting...");
    process.exit();
});

xmpp.connect({
        jid                 : connInfo.jid,
        password            : connInfo.pwd,
        host                : connInfo.host,
        port                : connInfo.port
});

logger.debug('Sending presence...');
xmpp.setPresence(STATUS.ONLINE, 'At work!');

logger.debug('Asking for roster...');
xmpp.getRoster();
