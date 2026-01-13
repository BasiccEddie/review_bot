const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a review by its ID (Owner only)')
        .addIntegerOption(option =>
            option.setName('id')
                  .setDescription('The number of the review to remove (1 = oldest)')
                  .setRequired(true)),
    async execute(interaction) {
        // Only server owner can use this command
        if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: '❌ Only the server owner can remove reviews.', ephemeral: true });
        }

        const id = interaction.options.getInteger('id');
        const filePath = path.join(__dirname, '..', 'reviews.json');
        const reviewsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (id < 1 || id > reviewsData.reviews.length) {
            return interaction.reply({ content: '❌ Invalid review ID.', ephemeral: true });
        }

        // Remove the review
        const removed = reviewsData.reviews.splice(id - 1, 1);

        fs.writeFileSync(filePath, JSON.stringify(reviewsData, null, 2));

        return interaction.reply({ content: `✅ Removed review by ${removed[0].user}`, ephemeral: true });
    }
};
