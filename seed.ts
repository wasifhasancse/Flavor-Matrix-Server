import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const mockRecipes = [
  {
    recipeName: "Classic Spaghetti Carbonara",
    title: "Classic Spaghetti Carbonara",
    description: "An elegant Roman pasta dish made with fresh eggs, hard cheese, cured pork, and black pepper.",
    recipeImage: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
    likesCount: 450,
    likes: 450,
    isFeatured: true,
    authorName: "Chef Luigi",
    author: "Chef Luigi",
    preparationTime: "10 mins",
    prepTime: "10 mins",
    cookTime: "15 mins",
    difficultyLevel: "Medium",
    difficulty: "Medium",
    category: "Italian",
    price: 3.99,
    status: "premium",
    ingredients: [
      "350g Spaghetti",
      "150g Pancetta or Guanciale (cubed)",
      "4 Large Egg yolks + 1 Whole egg",
      "75g Pecorino Romano cheese (grated)",
      "50g Parmigiano Reggiano cheese (grated)",
      "Coarsely crushed black pepper",
      "Salt for boiling pasta"
    ],
    instructions: [
      "Bring a large pot of salted water to a boil and cook spaghetti according to package directions until al dente.",
      "While pasta cooks, heat a pan over medium heat and crisp pancetta cubes until golden, then set pan aside.",
      "In a bowl, whisk egg yolks, the whole egg, grated Pecorino Romano, and Parmigiano Reggiano together to form a thick paste.",
      "Drain pasta, reserving 1 cup of pasta cooking water. Immediately toss hot pasta into the pan with pancetta.",
      "Remove pan from heat completely. Quickly pour egg-cheese mixture over pasta, tossing vigorously. Add reserved pasta water a splash at a time to create a creamy sauce without cooking the eggs.",
      "Season generously with freshly cracked black pepper and serve hot with extra grated cheese."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Spicy Thai Green Curry",
    title: "Spicy Thai Green Curry",
    description: "A fragrant, rich coconut-based green curry loaded with fresh herbs, vegetables, and chicken.",
    recipeImage: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80",
    likesCount: 380,
    likes: 380,
    isFeatured: true,
    authorName: "Nalee Siriporn",
    author: "Nalee Siriporn",
    preparationTime: "15 mins",
    prepTime: "15 mins",
    cookTime: "20 mins",
    difficultyLevel: "Hard",
    difficulty: "Hard",
    category: "Asian",
    price: 4.99,
    status: "premium",
    ingredients: [
      "400ml Coconut milk (full fat)",
      "3 tbsp Thai Green Curry Paste",
      "400g Chicken breast (thinly sliced)",
      "100g Bamboo shoots (sliced)",
      "1 Thai Eggplant (cubed)",
      "2 tbsp Fish sauce",
      "1 tbsp Palm sugar",
      "5 Kaffir lime leaves (torn)",
      "Handful of fresh Thai basil leaves",
      "2 Red bird's eye chilies (sliced)"
    ],
    instructions: [
      "Heat 1/2 cup of coconut milk in a large wok or deep pan over medium-high heat until it begins to boil and separate.",
      "Add green curry paste to the wok and stir fry for 2-3 minutes until extremely fragrant and oil glistens on top.",
      "Add sliced chicken breasts and stir fry to coat in curry paste until chicken starts to color.",
      "Pour in the remaining coconut milk, eggplant, bamboo shoots, and kaffir lime leaves. Bring to a gentle boil, then simmer for 10 minutes.",
      "Season curry with fish sauce and palm sugar. Adjust seasoning to taste (sweet, salty, spicy).",
      "Stir in Thai basil leaves and red chilies, remove from heat, and serve hot with jasmine rice."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Crispy Avocado Tacos",
    title: "Crispy Avocado Tacos",
    description: "Perfectly seasoned fried avocado slices served in warm corn tortillas with zesty lime crema.",
    recipeImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    likesCount: 520,
    likes: 520,
    isFeatured: true,
    authorName: "Elena Gomez",
    author: "Elena Gomez",
    preparationTime: "15 mins",
    prepTime: "15 mins",
    cookTime: "10 mins",
    difficultyLevel: "Easy",
    difficulty: "Easy",
    category: "Mexican",
    status: "free",
    ingredients: [
      "2 Firm avocados (sliced into wedges)",
      "1 cup Panko breadcrumbs",
      "1/2 cup All-purpose flour",
      "2 Eggs (beaten)",
      "1 tsp Chili powder & Cumin",
      "8 Small corn tortillas",
      "1/2 cup Sour cream or Mexican crema",
      "1 Lime (juiced)",
      "1 cup Shredded red cabbage",
      "Fresh cilantro & pickled onions for garnish"
    ],
    instructions: [
      "Set up a breading station: one bowl of flour seasoned with cumin/chili powder, one bowl with beaten eggs, and one with panko crumbs.",
      "Coat avocado wedges in flour, dip in egg, and press firmly into panko until fully coated.",
      "Heat 1 inch of frying oil in a skillet. Fry avocado wedges for 1-2 minutes per side until golden brown and crispy, then drain on paper towels.",
      "Whisk lime juice and sour cream together with a pinch of salt to make the lime crema.",
      "Warm corn tortillas in a dry skillet. Assemble by placing cabbage, crispy avocado slices, lime crema, cilantro, and pickled onions on each taco."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Decadent Chocolate Lava Cake",
    title: "Decadent Chocolate Lava Cake",
    description: "Indulgent individual cakes with a rich, warm gooey liquid chocolate center.",
    recipeImage: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    likesCount: 610,
    likes: 610,
    isFeatured: true,
    authorName: "Sarah Baker",
    author: "Sarah Baker",
    preparationTime: "10 mins",
    prepTime: "10 mins",
    cookTime: "12 mins",
    difficultyLevel: "Medium",
    difficulty: "Medium",
    category: "Desserts",
    price: 1.99,
    status: "premium",
    ingredients: [
      "115g High-quality semi-sweet chocolate",
      "115g Unsalted butter",
      "2 Whole eggs + 2 Egg yolks",
      "50g Granulated sugar",
      "A pinch of salt",
      "30g All-purpose flour",
      "Cocoa powder and butter for ramekin dusting",
      "Powdered sugar and vanilla ice cream for serving"
    ],
    instructions: [
      "Preheat oven to 425°F (218°C). Grease four 6-ounce ramekins with butter and dust lightly with cocoa powder.",
      "Melt butter and chopped chocolate together in a heatproof bowl set over a pot of simmering water (double boiler) until completely smooth.",
      "In a separate bowl, vigorously whisk whole eggs, yolks, sugar, and salt together until pale and slightly thickened.",
      "Fold melted chocolate mixture into the eggs, then gently fold in the flour until just combined (do not overmix).",
      "Divide batter equally among prepared ramekins. Bake for 12-14 minutes until the edges are firm but centers are soft.",
      "Let cool for 1 minute, invert onto dessert plates, dust with powdered sugar, and serve immediately with vanilla ice cream."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Seared Lemon Garlic Salmon",
    title: "Seared Lemon Garlic Salmon",
    description: "Crispy skin-on salmon fillet seared in a butter garlic reduction with fresh lemon wedges.",
    recipeImage: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=600&q=80",
    likesCount: 290,
    likes: 290,
    isFeatured: false,
    authorName: "Marcus Fisher",
    author: "Marcus Fisher",
    preparationTime: "5 mins",
    prepTime: "5 mins",
    cookTime: "15 mins",
    difficultyLevel: "Easy",
    difficulty: "Easy",
    category: "Seafood",
    status: "free",
    ingredients: [
      "2 Salmon fillets (skin-on)",
      "2 tbsp Butter",
      "3 Cloves garlic (minced)",
      "1 Lemon (sliced & juiced)",
      "1 tbsp Olive oil",
      "Salt, pepper, and fresh dill to season"
    ],
    instructions: [
      "Pat salmon fillets dry and season both sides generously with salt and black pepper.",
      "Heat olive oil and 1 tablespoon of butter in a pan over medium-high heat. Sear salmon skin-side down for 4-5 minutes until crispy.",
      "Flip salmon and sear the other side for 3 minutes.",
      "Add remaining butter, minced garlic, and lemon juice. Spoon melted garlic butter over salmon for 1 minute.",
      "Serve hot garnished with fresh dill and lemon slices."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Fresh Greek Mezze Salad",
    title: "Fresh Greek Mezze Salad",
    description: "Crisp cucumbers, juicy vine tomatoes, kalamata olives, and rich feta tossed in olive oil.",
    recipeImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    likesCount: 180,
    likes: 180,
    isFeatured: false,
    authorName: "Chloe Pappas",
    author: "Chloe Pappas",
    preparationTime: "10 mins",
    prepTime: "10 mins",
    cookTime: "0 mins",
    difficultyLevel: "Easy",
    difficulty: "Easy",
    category: "Salads",
    status: "free",
    ingredients: [
      "3 Vine tomatoes (chunky chopped)",
      "1 English cucumber (sliced)",
      "1 Red onion (sliced)",
      "100g Feta cheese (sliced into block)",
      "50g Kalamata olives",
      "3 tbsp Extra virgin olive oil",
      "1 tsp Dried oregano",
      "Pinch of salt"
    ],
    instructions: [
      "Combine chopped tomatoes, cucumber slices, olives, and red onions in a large shallow bowl.",
      "Drizzle olive oil over the vegetables and toss gently with a pinch of salt.",
      "Place the feta block on top of the salad.",
      "Sprinkle the feta and vegetables with dried oregano and extra olive oil before serving cold."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Slow Cooked French Onion Soup",
    title: "Slow Cooked French Onion Soup",
    description: "Rich beef broth featuring deeply caramelized sweet onions topped with toasted gruyère cheese.",
    recipeImage: "https://images.unsplash.com/photo-1689183591312-73c564fd01f9",
    image: "https://images.unsplash.com/photo-1689183591312-73c564fd01f9",
    likesCount: 310,
    likes: 310,
    isFeatured: false,
    authorName: "Pierre Laurent",
    author: "Pierre Laurent",
    preparationTime: "20 mins",
    prepTime: "20 mins",
    cookTime: "1 hr",
    difficultyLevel: "Hard",
    difficulty: "Hard",
    category: "Soups",
    status: "free",
    ingredients: [
      "4 Large sweet onions (thinly sliced)",
      "3 tbsp Butter",
      "1 tbsp Olive oil",
      "1L High-quality beef stock",
      "1/2 cup Dry white wine",
      "1 French baguette (sliced)",
      "150g Gruyère cheese (grated)",
      "Fresh thyme & bay leaf"
    ],
    instructions: [
      "Melt butter and oil in a heavy-bottomed Dutch oven. Add sliced onions and cook over low heat for 45-50 minutes, stirring occasionally, until caramelized and deep brown.",
      "Deglaze pan with white wine, scraping up all browned bits from the bottom.",
      "Add beef stock, thyme, and bay leaf. Bring to a boil, then reduce heat and simmer for 20 minutes.",
      "Toast baguette slices under a broiler.",
      "Ladle soup into oven-safe bowls, top with toasted bread, cover generously with grated Gruyère, and broil until bubbly and golden brown."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    recipeName: "Japanese Matcha Roll Cake",
    title: "Japanese Matcha Roll Cake",
    description: "Fluffy green tea sponge cake rolled with fresh sweet red bean whipped cream filling.",
    recipeImage: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=600&q=80",
    likesCount: 240,
    likes: 240,
    isFeatured: false,
    authorName: "Yuki Tanaka",
    author: "Yuki Tanaka",
    preparationTime: "25 mins",
    prepTime: "25 mins",
    cookTime: "20 mins",
    difficultyLevel: "Hard",
    difficulty: "Hard",
    category: "Desserts",
    status: "free",
    ingredients: [
      "4 Eggs (separated)",
      "80g Caster sugar",
      "50g Cake flour",
      "1 tbsp Matcha green tea powder",
      "30ml Milk",
      "150ml Heavy whipping cream",
      "2 tbsp Sweet red bean paste (anko)"
    ],
    instructions: [
      "Preheat oven to 375°F (190°C) and line a sheet pan with parchment paper.",
      "Whisk egg whites with half the sugar until stiff peaks form.",
      "Whisk egg yolks with the remaining sugar, milk, and sifted flour and matcha powder until smooth.",
      "Gently fold egg whites into the matcha batter in three additions, maintaining fluffiness.",
      "Spread batter evenly onto sheet pan and bake for 10-12 minutes. Roll sponge hot in a clean kitchen towel and let cool.",
      "Whip heavy cream. Unroll sponge, spread red bean paste and whipped cream on top, and roll tight. Refrigerate for 1 hour before slicing."
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri as string, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const dbName = process.env.MONGODB_DATABASE_NAME || "flavor-matrix";
    const db = client.db(dbName);

    const recipesCollection = db.collection("recipes");

    for (const mock of mockRecipes) {
      // Check if recipe already exists to avoid duplicates
      const exists = await recipesCollection.findOne({ title: mock.title });
      if (!exists) {
        await recipesCollection.insertOne(mock);
        console.log(`Inserted: ${mock.title}`);
      } else {
        console.log(`Skipped existing: ${mock.title}`);
      }
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.close();
  }
}

seed();
