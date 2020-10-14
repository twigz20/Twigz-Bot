module.exports = {
    name: 'reload',
    description: 'Reloads a command',
    args: true,
    usage: '[command name]',
    guildOnly: true,
    cooldown: 5,
    aliases: [],
    client: null,
    init(_client) {

    },
    execute(message, args) {
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);
    },
};