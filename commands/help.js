const { MessageEmbed } = require('discord.js');
const prefix = process.env.PREFIX;

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    args: true,
    usage: '[command name]',
    guildOnly: true,
    cooldown: 5,
    aliases: [],
    client: null,
    init(_client) {

    },
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('Here\'s a list of all my commands:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nYou can send \`${prefix} help [command name]\` to get info on a specific command!`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix} ${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });


        // let roles = message.member.roles.cache;
        // const embed = new MessageEmbed()
        //     // Set the title of the field
        //     .setTitle('Twigz Bot - Parameters Help')
        //     // Set the color of the embed
        //     .setColor(0xff0000)
        //     // Set the main content of the embed
        //     .addField('!twi [command] [arguments]', 'Example Command Structure.')
        //     .addField('!twi version', 'Get the current version of Twigz Bot.');

        // if (roles.find(m => m.name === "Supreme Leader") || roles.find(m => m.name === "Administrator")) {
        //     embed.addField('!twi clear [number]', 'Remove a certain amount of messages.')
        //         .addField('!twi upload [upload type]("giggidy")', 'Upload products to Specified Location.');
        // }
        // if (roles.find(m => m.name === "Giggidy")) {
        //     embed.addField('!twi upload giggidy', 'Upload products to Giggidy\'s Sex Toys.');
        // }
        // // Send the embed to the same channel as the message
        // message.channel.send(embed);
    },
};