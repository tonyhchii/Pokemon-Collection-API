require("dotenv").config();
const axios = require("axios");

// Pokémon TCG API base URL
const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2/cards";

// Helper function to map card data
const mapCardData = (card) => ({
  id: card.id,
  name: card.name,
  series: card.set.series,
  set_name: card.set.name,
  set_number: card.number,
  image_url: card.images.large,
  tcgplayer_url: card.tcgplayer?.url || null,
  prices: card.tcgplayer?.prices
    ? Object.entries(card.tcgplayer.prices).map(([condition, priceData]) => ({
        condition,
        price:
          priceData.market ||
          priceData.mid ||
          priceData.low ||
          priceData.high ||
          0,
      }))
    : [],
});

// Controller function to fetch cards
const getCards = async (req, res) => {
  const { search, page = 1, pageSize = 10 } = req.query;

  try {
    let queryParams = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    };

    if (search) {
      // If search term is provided, construct the query
      const searchTerms = search.split(" "); // Split the search query into terms
      const query = searchTerms
        .map(
          (term) =>
            `(name:*${term}* OR set.name:*${term}* OR set.series:*${term}*)`
        )
        .join(" AND ");
      queryParams.q = query; // Add the query to the params
    }

    // Fetch cards with pagination and optional search query
    const response = await axios.get(POKEMON_TCG_API_URL, {
      params: queryParams,
      headers: {
        "X-Api-Key": process.env.POKEMONTCGAPIKEY,
      },
    });

    // Map the card data
    const cards = response.data.data.map(mapCardData);

    // Get total count and total pages from the API response
    const totalCount = response.data.totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Send the response
    res.json({
      data: cards,
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
