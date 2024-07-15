import './App.css';
import React, { useEffect, useState } from 'react';
import {Food, FoodAmount, Meal, Diet, DietPlan } from './types'

const App: React.FC = () => {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [foods, setFoods] = useState<{ [key: string]: Food }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dietKey = 'jimmy-chow';

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

  return (
    <div className="App">
      <h2>{diet?.name}</h2>
      <ul>
        {diet?.meals.map((meal: Meal, index: number) => (
          <li key={index}>
            <h4>{meal.name}</h4>
            <ul>
              {meal.foodAmounts.map((foodAmount: FoodAmount, foodAmountIndex: number) => {
                const food = foods[foodAmount.key];
                return (
                  <li key={foodAmountIndex}>
                    {`${foodAmount.amount} ${food?.unit == '' ? food?.unit : food?.unit + ' of '} ${food?.name}`}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
