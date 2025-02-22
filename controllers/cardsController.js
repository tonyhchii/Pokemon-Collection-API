require("dotenv").config();
const axios = require("axios");
// Pokémon TCG API base URL
const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2/cards";
// Controller function to fetch cards
const getCards = async (req, res) => {
  const { search, page = 1, pageSize = 10 } = req.query;

  try {
    let cards;

    if (!search) {
      // If no search term, fetch all cards
      const response = await axios.get("https://api.pokemontcg.io/v2/cards", {
        params: {
          pageSize: 100, // Limit the number of results fetched
        },
        headers: {
          "X-Api-Key": process.env.POKEMONTCGAPIKEY, // Include the API key in the headers
        },
      });

      cards = response.data.data.map((card) => ({
        id: card.id,
        name: card.name,
        series: card.set.series,
        set_name: card.set.name,
        set_number: card.number,
        image_url: card.images.large,
        tcgplayer_url: card.tcgplayer?.url || null, // Fallback to null if tcgplayer is undefined
        prices: card.tcgplayer?.prices
          ? Object.entries(card.tcgplayer.prices).map(
              ([condition, priceData]) => ({
                condition,
                price:
                  priceData.market ||
                  priceData.mid ||
                  priceData.low ||
                  priceData.high ||
                  0,
              })
            )
          : [],
      }));
    } else {
      // If search term is provided, perform the search
      const searchTerms = search.split(" "); // Split the search query into terms

      // Construct the query for the Pokémon TCG API
      const query = searchTerms
        .map(
          (term) =>
            `(name:*${term}* OR set.name:*${term}* OR set.series:*${term}*)`
        )
        .join(" AND ");

      // Fetch cards with the query
      const response = await axios.get("https://api.pokemontcg.io/v2/cards", {
        params: {
          q: query,
          pageSize: 100, // Limit the number of results fetched
        },
        headers: {
          "X-Api-Key": process.env.POKEMONTCGAPIKEY, // Include the API key in the headers
        },
      });

      cards = response.data.data.map((card) => ({
        id: card.id,
        name: card.name,
        series: card.set.series,
        set_name: card.set.name,
        set_number: card.number,
        image_url: card.images.large,
        tcgplayer_url: card.tcgplayer?.url || null, // Fallback to null if tcgplayer is undefined
        prices: card.tcgplayer?.prices
          ? Object.entries(card.tcgplayer.prices).map(
              ([condition, priceData]) => ({
                condition,
                price:
                  priceData.market ||
                  priceData.mid ||
                  priceData.low ||
                  priceData.high ||
                  0,
              })
            )
          : [],
      }));
    }

    // Pagination
    const totalCount = cards.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedCards = cards.slice(startIndex, endIndex);

    // Send the response
    res.json({
      data: paginatedCards,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching data from Pokémon TCG API:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch data from Pokémon TCG API" });
  }
};

module.exports = {
  getCards,
};
