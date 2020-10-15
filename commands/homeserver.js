const { Message } = require('discord.js');
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

        var qbtScheduler1 = schedule.scheduleJob('0 0 * * *', async function () {
            var guild = _client.guilds.cache.get(process.env.GUILD_ID);
            if (guild) {
                let data = { content: "!twi homeserver qbittorrent resume" };
                let homeserver_channel = guild.channels.cache.get(process.env.HOMESERVER_CHANNEL_ID);
                let message = new Message(_client, data, homeserver_channel);
                message.author = guild.members.cache.get(process.env.GUILD_USER_ID);
                _client.emit('message', message);
            }
        });

        var qbtScheduler2 = schedule.scheduleJob('0 9 * * *', async function () {
            var guild = _client.guilds.cache.get(process.env.GUILD_ID);
            if (guild) {
                let data = { content: "!twi homeserver qbittorrent pause" };
                let homeserver_channel = guild.channels.cache.get(process.env.HOMESERVER_CHANNEL_ID);
                let message = new Message(_client, data, homeserver_channel);
                message.author = guild.members.cache.get(process.env.GUILD_USER_ID);
                _client.emit('message', message);
            }
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
                        return message.reply('Failed to connect to QBittorrent. Check Host, Username and Password.').then(msg => msg.delete(5000));
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
