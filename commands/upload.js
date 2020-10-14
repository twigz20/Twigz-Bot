const fs = require('fs');
const FileType = require('file-type');
const got = require('got');
const http = require('https');
const Promise = require('promise');

let download = function (url, dest) {
    return new Promise((resolve, reject) => {
        var file = fs.createWriteStream(dest);
        var request = http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();  // close() is async, call cb after close completes.
                resolve();
            });
        }).on('error', function (err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            reject(err.message);
        });
    });
};

module.exports = {
    name: 'upload',
    description: 'Upload things to server.',
    args: true,
    usage: '[upload type]',
    guildOnly: true,
    cooldown: 5,
    aliases: [],
    client: null,
    init(_client) {

    },
    execute(message, args) {
        let roles = message.member.roles.cache;
        if (!roles.find(m => m.name === "Giggidy") && !roles.find(m => m.name === "Supreme Leader"))
            return message.reply("You do not have permissions to run this command.").then(msg => msg.delete(5000));

        switch (args[0]) {
            case 'giggidy':
                if (message.channel.name != args[1]) return message.reply('Command: !twi upload `giggidy` can only be executed in the `giggidy` channel.').then(msg => msg.delete(5000));

                message.channel.send(`You may begin uploading files. After ${process.env.UPLOAD_TIMER} seconds of inactivity, files will be transferred to Giggidy's Sex Toys.`);

                let filter = m => m.author == message.author;//use that message only if the author is the same
                message.channel.awaitMessages(filter, { idle: (process.env.UPLOAD_TIMER * 1000) }).then(async collection => {
                    if (collection.size > 0) {
                        message.channel.send(`File transfer in progress. No more files will be accepted at this time.`);
                        collection.each(async msg => {
                            try {
                                let attachment = msg.attachments.first();
                                const stream = got.stream(attachment.attachment);
                                let details = await FileType.fromStream(stream);
                                if (typeof details != 'undefined' && details.mime.includes('image')) {
                                    let request = await download(attachment.attachment, `${process.env.UPLOAD_GIGGIDY_IMAGES_PATH}/${attachment.name}`);
                                    message.channel.send(`Uploaded ${attachment.name} successfully.`);
                                } else if (attachment.name == 'products.json') {
                                    let request = await download(attachment.attachment, `${process.env.UPLOAD_GIGGIDY_FILES_PATH}/${attachment.name}`);
                                    message.channel.send(`Uploaded ${attachment.name} successfully.`);
                                } else {
                                    message.reply(`Failed to upload ${attachment.name}.\nPlease upload only \`images\` or \`products.json\`.`);
                                }
                            } catch (err) {
                                message.reply(err); // TypeError: failed to fetch
                            }
                        });
                    } else {
                        message.channel.send(`No files captured. Cancelling upload.`);
                    }
                });
                break;
            default:
                return message.reply('No valid upload type specified.');
        }
    },
};