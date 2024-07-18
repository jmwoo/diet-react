import './App.css';
import React, { useEffect, useState } from 'react';
import {Food, FoodAmount, Meal, Diet, DietPlan, Macros } from './types'
import pluralize from 'pluralize';

const App: React.FC = () => {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [foods, setFoods] = useState<{ [key: string]: Food }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dietKey = 'jimmy-chow';

  function getFoodDescription(foodAmount: FoodAmount, food: Food) : string {
    return `${foodAmount.amount} ${food?.unit == '' ? food?.unit : pluralize(food?.unit, foodAmount.amount) + ' of '} ${food?.name}`;
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
      const dietPlanUrl = 'https://gist.githubusercontent.com/jmwoo/13a5fdcc8e07dbf81267289ac011412e/raw/8cbf1f6773c5f2e219ffd8045f4740c48ea5eda3/diet-plan.json';
      // const dietPlanUrl = '/assets/diet-plan.json';
      const response = await fetch(dietPlanUrl);
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
        <h1>{diet?.name}</h1>
        {diet?.meals.map((meal: Meal, index: number) => {
          const mealMacros = getMealMacros(meal.foodAmounts);
          return (
              <ul className="meals">
                <li key={index} className="meal">
                  <span className="meal-name">{meal.name}</span>
                  <ul>
                    {meal.foodAmounts.map((foodAmount: FoodAmount, foodAmountIndex: number) => {
                      const food = foods[foodAmount.key];
                      const foodMacros = getFoodMacros(foodAmount, food);
                      return (
                          <li key={foodAmountIndex} className="food">
                            <span className="food-description">{getFoodDescription(foodAmount, food)}</span>
                            <span className="macros">
                                <span className="macros-calories">(Calories: <span
                                    className="calories-emphasis">{displayMacroNumber(foodMacros.calories, true)}</span>,</span>
                                <span className="macros-protein">P: <span
                                    className="protein-emphasis">{displayMacroNumber(foodMacros.protein)}</span>,</span>
                                <span className="macros-carbs">C: <span
                                    className="carbs-emphasis">{displayMacroNumber(foodMacros.carbs)}</span>,</span>
                                <span className="macros-fat">F: <span
                                    className="fat-emphasis">{displayMacroNumber(foodMacros.fat)}</span>)</span>
                              </span>
                          </li>
                      );
                    })}
                  </ul>
                </li>

                <ul>
                  <h4>Total {meal.name} Macros</h4>
                  <div>Calories: <span
                      className="calories-emphasis">{displayMacroNumber(mealMacros.calories, true)}</span></div>
                  <div>Protein: <span className="protein-emphasis">{displayMacroNumber(mealMacros.protein)}</span></div>
                  <div>Carbohydrates: <span className="carbs-emphasis">{displayMacroNumber(mealMacros.carbs)}</span></div>
                  <div>Fats: <span className="fat-emphasis">{displayMacroNumber(mealMacros.fat)}</span></div>
                </ul>
              </ul>
          )
        })}

        <h3>Total Daily Macros</h3>
        <div>Calories: <span className="calories-emphasis">{displayMacroNumber(dietMacros.calories, true)}</span></div>
        <div>Protein: <span className="protein-emphasis">{displayMacroNumber(dietMacros.protein)}</span></div>
        <div>Carbohydrates: <span className="carbs-emphasis">{displayMacroNumber(dietMacros.carbs)}</span></div>
        <div>Fats: <span className="fat-emphasis">{displayMacroNumber(dietMacros.fat)}</span></div>

        <div className="source-link">
          <a href="https://github.com/jmwoo/diet-react" target="_blank">source</a>
        </div>
      </div>
);
};

export default App;
