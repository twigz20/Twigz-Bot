module.exports = {
    name: 'clear',
    description: 'Clears messages in channel.',
    args: true,
    usage: '[# of messages to clear]',
    guildOnly: true,
    cooldown: 5,
    aliases: [],
    client: null,
    init(_client) {

    },
    execute(message, args) {
        let roles = message.member.roles.cache;
        if (!roles.find(m => m.name === "Supreme Leader" || m.name === "Administrator"))
            return message.reply("You do not have permissions to run this command.").then(msg => msg.delete(5000));

        message.channel.bulkDelete(args[0]);
    },
};