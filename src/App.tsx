import React, { useEffect, useState } from 'react';
import {Food, FoodAmount, Meal, Diet, DietPlan, Macros } from './types'

const App: React.FC = () => {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [foods, setFoods] = useState<{ [key: string]: Food }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dietKey = 'jimmy-chow';

  function getFoodDescription(foodAmount: FoodAmount, food: Food) : string {
    return `${foodAmount.amount} ${food?.unit == '' ? food?.unit : food?.unit + ' of '} ${food?.name}`;
  }
  
  function getDietMacros(meals: Meal[]) : Macros {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    
    meals.forEach(meal => {
      const mealMacros = getMealMacros(meal.foodAmounts);
      totalProtein += mealMacros.protein;
      totalCarbs += mealMacros.carbs;
      totalFat += mealMacros.fat;
      totalCalories += mealMacros.calories;
    });
    
    return {
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      calories: totalCalories
    };
  }
  
  function getMealMacros(foodAmounts: FoodAmount[]) : Macros {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    
    foodAmounts.forEach(foodAmount => {
      const food = foods[foodAmount.key];
      const foodMacros = getFoodMacros(foodAmount, food);
      totalProtein += foodMacros.protein;
      totalCarbs += foodMacros.carbs;
      totalFat += foodMacros.fat;
      totalCalories += foodMacros.calories;
    });
    
    return {
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      calories: totalCalories
    };
  }
  
  function getFoodMacros(foodAmount: FoodAmount, food: Food) : Macros {
    const totalProtein = foodAmount.amount * food.protein;
    const totalCarbs = foodAmount.amount * food.carbs;
    const totalFat = foodAmount.amount * food.fat;
    const totalCalories = totalProtein * 4 + totalCarbs * 4 + totalFat * 9;
    
    return { 
      protein: totalProtein, 
      carbs: totalCarbs, 
      fat: totalFat, 
      calories: totalCalories
    };
  }

  function displayMacroNumber(value: number, isCalories: boolean = false) : string {
    const [integerPart, decimalPart] = value.toString().split(".");
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let ret = '';
    if (!decimalPart) {
      ret = formattedIntegerPart;
    }
    else if (decimalPart.length > 2) {
      const roundedValue = parseFloat(value.toFixed(2));
      ret = roundedValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    else {
      ret = formattedIntegerPart + "." + decimalPart;
    }
    if (isCalories) {
      return ret;
    }
    return ret + 'g';
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/diet-plan.json');
      if (!response.ok) { throw new Error(response.statusText); }
      const dietPlan: DietPlan = await response.json();

      const foods: { [key: string]: Food } = {};
      dietPlan.foods.forEach(food => {
        foods[food.key] = food;
      });
      setFoods(foods);

      const diet = dietPlan.diets.find(diet => diet.key === dietKey);
      if (!diet) { throw new Error(`${dietKey} not found`); }
      setDiet(diet);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <p>loading...</p>
  }

  const dietMacros = getDietMacros(diet?.meals || []);

  return (
      <div className="App">
        <h2>{diet?.name}</h2>
        <ul>
          {diet?.meals.map((meal: Meal, index: number) => {
            const mealMacros = getMealMacros(meal.foodAmounts);
            return (
                <li key={index}>
                  <span className="meal-name">{meal.name}</span>
                  <span className="macros">
                <span
                    className="macros-calories">&nbsp;(Calories: {displayMacroNumber(mealMacros.calories, true)},</span>
                <span className="macros-protein">&nbsp;P: {displayMacroNumber(mealMacros.protein)},</span>
                <span className="macros-carbs">&nbsp;C: {displayMacroNumber(mealMacros.carbs)},</span>
                <span className="macros-fat">&nbsp;F: {displayMacroNumber(mealMacros.fat)})</span>
              </span>
                  <ul>
                    {meal.foodAmounts.map((foodAmount: FoodAmount, foodAmountIndex: number) => {
                      const food = foods[foodAmount.key];
                      const foodMacros = getFoodMacros(foodAmount, food);
                      return (
                          <li key={foodAmountIndex}>
                            <span className="food-description">{getFoodDescription(foodAmount, food)}</span>
                            <span className="macros">
                        <span
                            className="macros-calories">&nbsp;(Calories: {displayMacroNumber(foodMacros.calories, true)},</span>
                        <span className="macros-protein">&nbsp;P: {displayMacroNumber(foodMacros.protein)},</span>
                        <span className="macros-carbs">&nbsp;C: {displayMacroNumber(foodMacros.carbs)},</span>
                        <span className="macros-fat">&nbsp;F: {displayMacroNumber(foodMacros.fat)})</span>
                      </span>
                          </li>
                      );
                    })}
                  </ul>
                </li>
            )
          })}
        </ul>

        <h3>Total Macros</h3>
        <div>Calories: {displayMacroNumber(dietMacros.calories, true)}</div>
        <div>Protein: {displayMacroNumber(dietMacros.protein)}</div>
        <div>Carbohydrates: {displayMacroNumber(dietMacros.carbs)}</div>
        <div>Fats: {displayMacroNumber(dietMacros.fat)}</div>
      </div>
  );
};

export default App;
