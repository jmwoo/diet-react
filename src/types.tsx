export type Food = {
	key: string,
	name: string,
	unit: string,
	protein: number,
	carbs: number,
	fat: number
};

export type FoodAmount = {
	key: string,
	amount: number
};

export type Meal = {
	name: string,
	foodAmounts: FoodAmount[]
};

export type Diet = {
	name: string,
	key: string,
	meals: Meal[]
}

export type DietPlan = {
	foods: Food[],
	diets: Diet[]
};

export type Macros = {
	protein: number,
	carbs: number,
	fat: number,
	calories: number
};