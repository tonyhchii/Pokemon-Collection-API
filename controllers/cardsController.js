const axios = require("axios");

// Pokémon TCG API base URL
const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2/cards";

// Controller function to fetch cards
const getCards = async (req, res) => {
  const { name, set, page = 1, pageSize = 10 } = req.query;

  try {
    // Build query parameters for the Pokémon TCG API
    const queryParams = {
      q: [], // Array to hold query conditions
      page: parseInt(page),
      pageSize: Math.min(parseInt(pageSize), 100), // Ensure pageSize is <= 100
    };

    // Add name filter
    if (name) {
      queryParams.q.push(`name:"*${name}*"`);
    }

    // Add set filter
    if (set) {
      queryParams.q.push(`set.name:"*${set}*"`);
    }

    // Join query conditions with ' AND '
    queryParams.q = queryParams.q.join(" AND ");

    console.log(queryParams.q);

    // Make a GET request to the Pokémon TCG API
    const response = await axios.get(POKEMON_TCG_API_URL, {
      params: queryParams,
    });

    // Extract card data from the API response
    const cards = response.data.data.map((card) => ({
      id: card.id,
      name: card.name,
      series: card.series,
      set_name: card.set.name,
      set_number: card.number,
      image_url: card.images.large,
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

    // Pagination metadata
    const totalCount = response.data.totalCount;
    const totalPages = Math.ceil(totalCount / queryParams.pageSize);

    // Send the response
    res.json({
      data: cards,
      pagination: {
        page: parseInt(page),
        pageSize: queryParams.pageSize,
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
