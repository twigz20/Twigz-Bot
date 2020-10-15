module.exports = {
    name: 'version',
    description: 'Version',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 5,
    aliases: [],
    client: null,
    init(_client) {

    },
    execute(message, args) {
        message.channel.send(process.env.VERSION);
    },
};