const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Add a review')
        .addIntegerOption(option =>
            option.setName('rating')
                  .setDescription('Rating from 1 to 5')
                  .setRequired(true)
                  .setMinValue(1)
                  .setMaxValue(5))
        .addStringOption(option =>
            option.setName('comment')
                  .setDescription('Your feedback')
                  .setRequired(true)),
    async execute(interaction) {
        const member = interaction.member;

        if (!member.roles.cache.some(r => ['Client', 'Customers'].includes(r.name))) {
            return interaction.reply({ content: 'You do not have permission to add a review.', ephemeral: true });
        }

        const rating = interaction.options.getInteger('rating');
        const comment = interaction.options.getString('comment');

        const filePath = path.join(__dirname, '..', 'reviews.json');
        const reviewsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        reviewsData.reviews.push({
            user: interaction.user.tag,
            rating: rating,
            comment: comment,
            date: new Date().toISOString()
        });

        fs.writeFileSync(filePath, JSON.stringify(reviewsData, null, 2));

        return interaction.reply({ content: `✅ Your review has been added!`, ephemeral: true });
    }
};
