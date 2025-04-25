import React, { useState, useEffect } from 'react';

const SeasonalFoods = () => {
  const [season, setSeason] = useState('spring');
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  // Seasonal foods database with recipes
  const seasonalFoodsData = {
    spring: [
      { 
        name: 'Asparagus', 
        nutrients: 'Folate, Vitamins A, C, K', 
        benefits: 'Supports digestive health and reduces inflammation',
        recipe: {
          name: 'Roasted Asparagus with Lemon',
          ingredients: ['1 bunch asparagus', '2 tbsp olive oil', '1 lemon', 'Salt and pepper to taste'],
          instructions: 'Trim asparagus ends. Toss with olive oil, salt, and pepper. Roast at 400°F for 12-15 minutes. Squeeze fresh lemon juice before serving.'
        }
      },
      { 
        name: 'Artichokes', 
        nutrients: 'Antioxidants, Fiber, Vitamin C', 
        benefits: 'Improves digestion and liver function',
        recipe: {
          name: 'Steamed Artichokes with Garlic Dip',
          ingredients: ['2 artichokes', '2 cloves garlic, minced', '1/4 cup Greek yogurt', '1 tbsp lemon juice', 'Salt to taste'],
          instructions: 'Trim artichokes and steam for 25-30 minutes. Mix garlic, yogurt, lemon juice, and salt for dip. Serve artichokes warm with dip.'
        }
      },
      { 
        name: 'Strawberries', 
        nutrients: 'Vitamin C, Manganese, Folate', 
        benefits: 'Boosts immunity and heart health',
        recipe: {
          name: 'Strawberry Spinach Salad',
          ingredients: ['2 cups fresh spinach', '1 cup sliced strawberries', '1/4 cup feta cheese', '2 tbsp balsamic vinaigrette', '2 tbsp sliced almonds'],
          instructions: 'Toss spinach, strawberries, and feta in a bowl. Drizzle with vinaigrette and top with almonds. Serve immediately.'
        }
      },
      { 
        name: 'Peas', 
        nutrients: 'Protein, Fiber, Vitamins A, C, K', 
        benefits: 'Supports energy and muscle building',
        recipe: {
          name: 'Minted Pea Soup',
          ingredients: ['2 cups fresh peas', '1 small onion, diced', '2 cups vegetable broth', '1/4 cup fresh mint leaves', '1/2 cup Greek yogurt'],
          instructions: 'Sauté onion until soft. Add peas and broth, simmer for 5 minutes. Add mint, blend until smooth. Stir in yogurt and serve warm.'
        }
      },
      { 
        name: 'Spinach', 
        nutrients: 'Iron, Calcium, Vitamins A, K', 
        benefits: 'Enhances bone health and immune function',
        recipe: {
          name: 'Spinach and Feta Stuffed Chicken',
          ingredients: ['2 chicken breasts', '2 cups spinach', '1/4 cup feta cheese', '1 tbsp olive oil', '1 tsp dried oregano'],
          instructions: 'Butterfly chicken breasts. Mix spinach, feta, and oregano. Stuff chicken with mixture. Secure with toothpicks, brush with oil, and bake at 375°F for 25 minutes.'
        }
      }
    ],
    summer: [
      { 
        name: 'Tomatoes', 
        nutrients: 'Lycopene, Vitamins A, C, K', 
        benefits: 'Promotes skin and heart health',
        recipe: {
          name: 'Fresh Bruschetta',
          ingredients: ['4 ripe tomatoes, diced', '1/4 cup fresh basil, chopped', '2 cloves garlic, minced', 'Baguette slices', '2 tbsp olive oil'],
          instructions: 'Mix tomatoes, basil, garlic, and olive oil. Toast baguette slices. Top with tomato mixture and serve immediately.'
        }
      },
      { 
        name: 'Zucchini', 
        nutrients: 'Vitamins A, C, Potassium', 
        benefits: 'Aids in digestion and eye health',
        recipe: {
          name: 'Zucchini Noodles with Pesto',
          ingredients: ['2 medium zucchini', '1/4 cup pesto sauce', '1/4 cup cherry tomatoes, halved', '2 tbsp pine nuts', 'Parmesan cheese'],
          instructions: 'Spiralize zucchini into noodles. Toss with pesto. Top with tomatoes, pine nuts, and freshly grated Parmesan.'
        }
      },
      { 
        name: 'Berries', 
        nutrients: 'Antioxidants, Vitamin C, Fiber', 
        benefits: 'Improves brain function and blood sugar regulation',
        recipe: {
          name: 'Triple Berry Smoothie Bowl',
          ingredients: ['1 cup mixed berries (strawberries, blueberries, raspberries)', '1 frozen banana', '1/2 cup Greek yogurt', '1 tbsp honey', 'Toppings: chia seeds, granola, more berries'],
          instructions: 'Blend berries, banana, yogurt, and honey until smooth. Pour into bowl and add toppings.'
        }
      },
      { 
        name: 'Bell Peppers', 
        nutrients: 'Vitamins A, C, B6', 
        benefits: 'Supports eye health and reduces inflammation',
        recipe: {
          name: 'Stuffed Bell Peppers',
          ingredients: ['4 bell peppers, tops removed and seeded', '1 cup cooked quinoa', '1/2 lb ground turkey, cooked', '1/2 cup diced tomatoes', '1/2 cup shredded cheese'],
          instructions: 'Mix quinoa, turkey, and tomatoes. Stuff peppers with mixture. Top with cheese. Bake at 375°F for 25-30 minutes.'
        }
      },
      { 
        name: 'Watermelon', 
        nutrients: 'Lycopene, Vitamin C, Water', 
        benefits: 'Hydrating and beneficial for heart health',
        recipe: {
          name: 'Watermelon Feta Salad',
          ingredients: ['4 cups cubed watermelon', '1/2 cup feta cheese', '1/4 cup fresh mint leaves', '2 tbsp lime juice', '2 tbsp olive oil'],
          instructions: 'Combine watermelon, feta, and mint in a bowl. Whisk lime juice and olive oil, drizzle over salad. Toss gently and serve chilled.'
        }
      }
    ],
    fall: [
      { 
        name: 'Apples', 
        nutrients: 'Fiber, Vitamin C, Antioxidants', 
        benefits: 'Supports gut health and immune system',
        recipe: {
          name: 'Baked Cinnamon Apples',
          ingredients: ['4 apples, cored', '2 tbsp butter', '2 tbsp brown sugar', '1 tsp cinnamon', '1/4 cup chopped walnuts'],
          instructions: 'Place cored apples in baking dish. Mix butter, sugar, cinnamon, and walnuts. Fill apple centers with mixture. Bake at 350°F for 30 minutes.'
        }
      },
      { 
        name: 'Sweet Potatoes', 
        nutrients: 'Beta-carotene, Vitamin C, Potassium', 
        benefits: 'Enhances eye health and immunity',
        recipe: {
          name: 'Sweet Potato and Black Bean Tacos',
          ingredients: ['2 sweet potatoes, diced', '1 can black beans, drained', '1 tsp cumin', '1/2 tsp chili powder', 'Corn tortillas'],
          instructions: 'Roast sweet potatoes with spices at 400°F for 25 minutes. Warm beans. Fill tortillas with sweet potatoes, beans, and toppings of your choice.'
        }
      },
      { 
        name: 'Pumpkin', 
        nutrients: 'Vitamin A, Fiber, Potassium', 
        benefits: 'Boosts immunity and eye health',
        recipe: {
          name: 'Creamy Pumpkin Soup',
          ingredients: ['2 cups pumpkin puree', '1 onion, diced', '2 cloves garlic, minced', '3 cups vegetable broth', '1/2 cup coconut milk'],
          instructions: 'Sauté onion and garlic. Add pumpkin and broth, simmer for 15 minutes. Blend until smooth. Stir in coconut milk and warm through.'
        }
      },
      { 
        name: 'Brussels Sprouts', 
        nutrients: 'Vitamins C, K, Fiber', 
        benefits: 'Promotes bone health and reduces inflammation',
        recipe: {
          name: 'Maple Balsamic Brussels Sprouts',
          ingredients: ['1 lb Brussels sprouts, halved', '2 tbsp olive oil', '1 tbsp maple syrup', '1 tbsp balsamic vinegar', 'Salt and pepper'],
          instructions: 'Toss Brussels sprouts with oil, salt, and pepper. Roast at 400°F for 20 minutes. Whisk maple syrup and vinegar, toss with roasted sprouts.'
        }
      },
      { 
        name: 'Kale', 
        nutrients: 'Vitamins A, C, K, Calcium', 
        benefits: 'Supports heart health and bone strength',
        recipe: {
          name: 'Kale and White Bean Soup',
          ingredients: ['1 bunch kale, chopped', '1 can white beans, drained', '1 onion, diced', '2 carrots, diced', '6 cups chicken broth'],
          instructions: 'Sauté onion and carrots. Add broth, beans, and kale. Simmer for 20 minutes. Season with herbs and spices of your choice.'
        }
      }
    ],
    winter: [
      { 
        name: 'Citrus Fruits', 
        nutrients: 'Vitamin C, Fiber, Antioxidants', 
        benefits: 'Boosts immune system and skin health',
        recipe: {
          name: 'Winter Citrus Salad',
          ingredients: ['2 oranges, segmented', '1 grapefruit, segmented', '1 blood orange, segmented', '2 tbsp honey', '2 tbsp mint, chopped'],
          instructions: 'Arrange citrus segments on a plate. Drizzle with honey and sprinkle with mint. Chill before serving.'
        }
      },
      { 
        name: 'Winter Squash', 
        nutrients: 'Vitamins A, C, Fiber', 
        benefits: 'Supports eye health and digestion',
        recipe: {
          name: 'Butternut Squash Risotto',
          ingredients: ['2 cups butternut squash, diced', '1 cup arborio rice', '4 cups vegetable broth', '1/2 cup Parmesan cheese', '1/4 cup sage leaves'],
          instructions: 'Roast squash at 400°F for 25 minutes. Cook rice in broth gradually until creamy. Fold in squash and cheese. Garnish with fried sage leaves.'
        }
      },
      { 
        name: 'Broccoli', 
        nutrients: 'Vitamins C, K, Fiber', 
        benefits: 'Enhances bone health and immune function',
        recipe: {
          name: 'Broccoli Cheddar Soup',
          ingredients: ['4 cups broccoli florets', '1 onion, diced', '2 cups vegetable broth', '1 cup milk', '1 cup shredded cheddar cheese'],
          instructions: 'Sauté onion. Add broccoli and broth, simmer until tender. Blend until smooth. Return to pot, add milk and cheese, stir until melted.'
        }
      },
      { 
        name: 'Pomegranates', 
        nutrients: 'Antioxidants, Vitamin C, K', 
        benefits: 'Reduces inflammation and supports heart health',
        recipe: {
          name: 'Pomegranate Avocado Salad',
          ingredients: ['1 cup pomegranate seeds', '2 avocados, diced', '4 cups mixed greens', '1/4 cup feta cheese', '2 tbsp balsamic vinaigrette'],
          instructions: 'Toss greens with vinaigrette. Top with avocado, pomegranate seeds, and feta cheese. Serve immediately.'
        }
      },
      { 
        name: 'Root Vegetables', 
        nutrients: 'Fiber, Potassium, Vitamin C', 
        benefits: 'Boosts energy and digestive health',
        recipe: {
          name: 'Roasted Root Vegetable Medley',
          ingredients: ['2 carrots, chopped', '2 parsnips, chopped', '1 sweet potato, chopped', '2 tbsp olive oil', '1 tbsp rosemary, chopped'],
          instructions: 'Toss vegetables with oil, rosemary, salt, and pepper. Roast at 425°F for 35-40 minutes, stirring halfway through.'
        }
      }
    ]
  };

  // Change to use selected season directly
  useEffect(() => {
    setFoods(seasonalFoodsData[season]);
  }, [season]);

  // Format season name with capitalized first letter
  const formatSeason = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Function to get season color
  const getSeasonColor = () => {
    switch (season) {
      case 'spring': return '#4CAF50'; // Green
      case 'summer': return '#FF9800'; // Orange
      case 'fall': return '#F44336';   // Red
      case 'winter': return '#2196F3'; // Blue
      default: return '#333';
    }
  };

  return (
    <div className="seasonal-foods card-hover">
      <div className="season-header" style={{ borderColor: getSeasonColor() }}>
        <h3>Seasonal Food Recommendations</h3>
        <div className="season-badge" style={{ backgroundColor: getSeasonColor() }}>
          {formatSeason(season)}
        </div>
      </div>
      
      {/* Add season selector */}
      <div className="season-selector">
        <p>Select a season:</p>
        <div className="season-buttons">
          <button 
            className={season === 'spring' ? 'active' : ''} 
            style={{ borderColor: '#4CAF50', color: season === 'spring' ? '#fff' : '#4CAF50', backgroundColor: season === 'spring' ? '#4CAF50' : 'transparent' }}
            onClick={() => setSeason('spring')}
          >
            Spring
          </button>
          <button 
            className={season === 'summer' ? 'active' : ''} 
            style={{ borderColor: '#FF9800', color: season === 'summer' ? '#fff' : '#FF9800', backgroundColor: season === 'summer' ? '#FF9800' : 'transparent' }}
            onClick={() => setSeason('summer')}
          >
            Summer
          </button>
          <button 
            className={season === 'fall' ? 'active' : ''} 
            style={{ borderColor: '#F44336', color: season === 'fall' ? '#fff' : '#F44336', backgroundColor: season === 'fall' ? '#F44336' : 'transparent' }}
            onClick={() => setSeason('fall')}
          >
            Fall
          </button>
          <button 
            className={season === 'winter' ? 'active' : ''} 
            style={{ borderColor: '#2196F3', color: season === 'winter' ? '#fff' : '#2196F3', backgroundColor: season === 'winter' ? '#2196F3' : 'transparent' }}
            onClick={() => setSeason('winter')}
          >
            Winter
          </button>
        </div>
      </div>
      
      <p className="season-intro">
        Eating seasonally helps you get the most nutritious and affordable foods. 
        Here are the top foods to include in your diet during {formatSeason(season)}:
      </p>
      
      <div className="seasonal-foods-grid">
        {foods.map((food, index) => (
          <div 
            className={`food-card ${selectedFood === index ? 'food-card-active' : ''}`} 
            key={index}
            onClick={() => setSelectedFood(selectedFood === index ? null : index)}
          >
            <h4>{food.name}</h4>
            <div className="food-details">
              <p className="food-nutrients"><strong>Key nutrients:</strong> {food.nutrients}</p>
              <p className="food-benefits"><strong>Benefits:</strong> {food.benefits}</p>
              <p className="food-recipe-prompt">
                <span role="button" className="recipe-button">
                  {selectedFood === index ? 'Hide recipe ▲' : 'Show recipe ▼'}
                </span>
              </p>
            </div>
            {selectedFood === index && (
              <div className="food-recipe">
                <h5>{food.recipe.name}</h5>
                <div className="recipe-ingredients">
                  <p><strong>Ingredients:</strong></p>
                  <ul>
                    {food.recipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div className="recipe-instructions">
                  <p><strong>Instructions:</strong></p>
                  <p>{food.recipe.instructions}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="seasonal-tip">
        <span>💡 Tip:</span> Seasonal foods are often fresher, tastier, and more nutritious because they're harvested at their peak.
      </div>
    </div>
  );
};

export default SeasonalFoods; 