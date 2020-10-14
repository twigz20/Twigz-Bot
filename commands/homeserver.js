const qbittorrent = require('qbittorrent-api-v2');
const schedule = require('node-schedule');

let qbt;
module.exports = {
    name: 'homeserver',
    description: 'Home Server Management',
    args: true,
    usage: '[application] [action]',
    guildOnly: true,
    cooldown: 5,
    aliases: [],
    client: null,
    init(_client) {
        this.client = _client;
        qbittorrent.connect(process.env.QBT_HOST, process.env.QBT_USERNAME, process.env.QBT_PASSWORD)
            .then(qbt_ => {
                qbt = qbt_;
                console.error('Successfully connected to QBittorrent.');
            })
            .catch(err => {
                console.error('Failed to connect to QBittorrent. Check Host, Username and Password.');
                console.error(err);
            });

        var qbtScheduler1 = schedule.scheduleJob('0 * * * *', async function () {
            if (!qbt) {
                try {
                    qbt = await qbittorrent.connect(process.env.QBT_HOST, process.env.QBT_USERNAME, process.env.QBT_PASSWORD);
                } catch (err) {
                    console.error('Failed to connect to QBittorrent. Check Host, Username and Password.');
                    console.error(err);
                }
            }
            qbt.torrents('paused')
                .then(torrents => {
                    let pausedTorrents = torrents
                        .map(function (value) {
                            return value.hash;
                        })
                        .join('|');
                    qbt.resumeTorrents(pausedTorrents)
                        .then(function () {
                            const channel = _client.channels.cache.find(channel => channel.id === '765750393291538462')
                            channel.send(`All applicable torrents resumed.`)
                            console.log("All applicable torrents resumed.");
                        })
                        .catch(err => {
                            console.error(err)
                        })
                })
                .catch(err => {
                    console.error(err)
                })
        });

        var qbtScheduler2 = schedule.scheduleJob('0 9 * * *', async function () {
            if (!qbt) {
                try {
                    qbt = await qbittorrent.connect(process.env.QBT_HOST, process.env.QBT_USERNAME, process.env.QBT_PASSWORD);
                } catch (err) {
                    console.error('Failed to connect to QBittorrent. Check Host, Username and Password.');
                    console.error(err);
                }
            }
            qbt.torrents('resumed')
                .then(torrents => {
                    let resumedTorrents = torrents
                        .map(function (value) {
                            return value.hash;
                        })
                        .join('|');
                    qbt.pauseTorrents(resumedTorrents)
                        .then(function () {
                            const channel = _client.channels.cache.find(channel => channel.id === '765750393291538462')
                            channel.send(`All applicable torrents paused.`)
                            console.log("All applicable torrents paused.");
                        })
                        .catch(err => {
                            console.error(err)
                        })
                })
                .catch(err => {
                    console.error(err)
                })
        });
    },
    async execute(message, args) {
        let roles = message.member.roles.cache;
        if (!roles.find(m => m.name === "Supreme Leader"))
            return message.reply("You do not have permissions to run this command.").then(msg => msg.delete(5000));

        switch (args[0]) {
            case 'qbittorrent':
                if (!args[1]) return message.reply('Command Syntax: !twi homeserver qbittorrent [action].');

                if (!qbt) {
                    try {
                        qbt = await qbittorrent.connect(process.env.QBT_HOST, process.env.QBT_USERNAME, process.env.QBT_PASSWORD);
                    } catch (err) {
                        console.error('Failed to connect to QBittorrent. Check Host, Username and Password.');
                        console.error(err);
                    }
                }

                switch (args[1]) {
                    case 'pause':
                        qbt.torrents('resumed')
                            .then(torrents => {
                                let resumedTorrents = torrents
                                    .map(function (value) {
                                        return value.hash;
                                    })
                                    .join('|');
                                qbt.pauseTorrents(resumedTorrents)
                                    .then(function () {
                                        message.channel.send(`All applicable torrents paused.`);
                                        console.log("All applicable torrents paused.");
                                    })
                                    .catch(err => {
                                        console.error(err)
                                    })
                            })
                            .catch(err => {
                                console.error(err)
                            })
                        break;
                    case 'resume':
                        qbt.torrents('paused')
                            .then(torrents => {
                                let pausedTorrents = torrents
                                    .map(function (value) {
                                        return value.hash;
                                    })
                                    .join('|');
                                qbt.resumeTorrents(pausedTorrents)
                                    .then(function () {
                                        message.channel.send(`All applicable torrents resumed.`);
                                        console.log("All applicable torrents resumed.");
                                    })
                                    .catch(err => {
                                        console.error(err)
                                    })
                            })
                            .catch(err => {
                                console.error(err)
                            })
                        break;
                }
                break;
            default:
                return message.reply('No valid upload type specified.');
        }
    },
};
