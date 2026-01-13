const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reviews')
        .setDescription('Show the last 5 reviews and overall rating'),
    async execute(interaction) {
        const filePath = path.join(__dirname, '..', 'reviews.json');
        const reviewsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const lastReviews = reviewsData.reviews.slice(-5).reverse();
        const totalRating = reviewsData.reviews.reduce((acc, r) => acc + r.rating, 0);
        const overallRating = reviewsData.reviews.length > 0 ? (totalRating / reviewsData.reviews.length).toFixed(1) : 0;

        // Function to convert number to star emojis
        const getStars = (rating) => {
            const fullStars = Math.floor(rating);
            const halfStar = rating - fullStars >= 0.5 ? '½' : '';
            return '⭐'.repeat(fullStars) + halfStar;
        };

        const embed = new EmbedBuilder()
            .setTitle('📊 Player Reviews')
            .setDescription(`Overall Rating: ${getStars(overallRating)} (${overallRating}/5)`)
            .setColor('Blue');

        if (lastReviews.length === 0) {
            embed.addFields({ name: 'No reviews yet', value: 'Be the first to add one with /review!' });
        } else {
            lastReviews.forEach((r, index) => {
                // Calculate actual ID in the full reviews array
                const reviewId = reviewsData.reviews.length - lastReviews.length + index + 1;
                embed.addFields({ 
                    name: `ID ${reviewId} - ${r.user} - ${getStars(r.rating)} (${r.rating}/5)`, 
                    value: r.comment 
                });
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
