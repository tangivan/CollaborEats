import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { validateInput } from '../../helpers/validation';
import { addFork, addRecipe, uploadImage } from '../../services/api';
import IngredientInput from './IngredientInput';

const RecipeForm = ({ title, recipe }) => {
  recipe = recipe || {};
  const [recipeForm, setRecipeForm] = useState({
    title: recipe.title || '',
    description: recipe.description || '',
    instructions: recipe.instructions || '',
    ingredients: recipe.ingredients || [{ ingredient: '', amount: '', unitOfMeasure: '' }],
    photo: '',
  });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState({});

  const { userId } = useContext(AuthContext);
  let history = useHistory();

  const editInput = (e) => {
    setRecipeForm({
      ...recipeForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e) => {
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError({});

    const newRecipe = { ...recipeForm };

    // VALIDATION, to be moved to custom hook
    const validationOptions = {
      title: { characterCount: 30 },
      photo: { required: false },
    };

    let containsErrors = false;

    // Validations for title, description, and instructions
    for (const property in newRecipe) {
      const inputError = validateInput(newRecipe[property], validationOptions[property]);
      if (inputError) {
        setFormError((prev) => {
          return { ...prev, [property]: inputError };
        });

        containsErrors = true;
      }
    }

    // Validations for the ingredients section
    for (const ingredient of newRecipe.ingredients) {
      const errors = {
        amount: validateInput(ingredient.amount, { characterCount: 5 }),
        ingredient: validateInput(ingredient.ingredient, {
          characterCount: 30,
        }),
        unitOfMeasure: validateInput(ingredient.unitOfMeasure, {
          required: false,
        }),
      };

      const filteredErrors = {};

      for (const error in errors) {
        if (errors[error]) {
          filteredErrors[error] = errors[error];
          containsErrors = true;
        }
      }

      setFormError((prev) => ({ ...prev, ...filteredErrors }));
    }

    if (containsErrors) return;

    // POST request after validations
    try {
      // only upload image when form validated
      if (file) {
        newRecipe.photo = await uploadImage(file);
      }

      // Only on fork
      if (recipe._id) {
        const result = await addFork(userId, recipe._id, newRecipe);
        return history.push(`/recipe/${result.data._id}`);
      }

      const result = await addRecipe(userId, newRecipe);
      return history.push(`/recipe/${result.data._id}`);
    } catch (error) {
      // TODO: render page depending on server error
      console.log(error);
    }
  };

  const IngredientsInputs = recipeForm.ingredients.map((ingredient, index) => {
    return (
      <IngredientInput
        key={index}
        {...ingredient}
        index={index}
        setRecipeForm={setRecipeForm}
        recipeForm={recipeForm}
        formError={formError}
        setFormError={setFormError}
      />
    );
  });

  const addIngredient = () => {
    const newIngredient = { ingredient: '', amount: '', unitOfMeasure: '' };
    setRecipeForm((prev) => {
      const ingredients = [...prev.ingredients];
      ingredients[ingredients.length] = newIngredient;
      return {
        ...prev,
        ingredients,
      };
    });
  };

  return (
    <>
      {/* <h1 className="text-6xl font-serif my-8">{title}</h1> */}
      <div className="flex flex-col justify-center p-5 rounded-t">
        <img className="w-16 h-16 mx-auto" src="/images/logo.svg" alt="" />
        <h3 className="text-3xl font-serif font-semibold mx-auto px-auto">{title}</h3>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded px-8 flex flex-col">
        <div class="mx-3 flex flex-col mb-3">
          <label htmlFor="title" className="block text-xl font-semibold">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Polish Burgers"
            className="w-1/3 px-4 py-2 border-2 mb-3 border-gray-300 rounded-sm outline-none  focus:border-blue-400  focus:bg-white transition duration-200 ease-in-out"
            value={recipeForm.title}
            onChange={editInput}
          ></input>
          {formError.title && (
            <h4 className="mx-auto text-red-700 font-serif">{formError.title}</h4>
          )}
          <div class="w-full mb-0">
            <label htmlFor="description" className="block text-xl font-semibold">
              Description
            </label>
            <textarea
              name="description"
              className="w-full h-32 px-4 py-3 border-2 mb-3 border-gray-300 rounded-sm outline-none focus:border-blue-400 transition duration-200 ease-in-out"
              placeholder="This recipe is a family favorite that was passed down over the generations..."
              value={recipeForm.description}
              onChange={editInput}
            ></textarea>
            {formError.description && (
              <h4 className="mx-auto text-red-700 font-serif">{formError.description}</h4>
            )}
          </div>
        </div>
        <div class="mx-3 flex">
          <div class="w-full mb-0">
            <label htmlFor="instructions" className="block text-xl font-semibold">
              Instructions
            </label>
            <textarea
              name="instructions"
              className="w-full h-32 px-4 py-3 border-2 mb-3 border-gray-300 rounded-sm outline-none focus:border-blue-400"
              placeholder="Instructions"
              value={recipeForm.instructions}
              onChange={editInput}
            ></textarea>
            {formError.instructions && (
              <h4 className="mx-auto text-red-700 font-serif">{formError.instructions}</h4>
            )}
          </div>
        </div>
        <label className="mx-3 block text-xl font-semibold mb-2">Ingredients</label>
        {formError.ingredient && (
          <h4 className="mx-auto text-red-700 font-serif">Ingredient: {formError.ingredient}</h4>
        )}
        {formError.amount && (
          <h4 className="mx-auto text-red-700 font-serif">Amount: {formError.amount}</h4>
        )}
        {formError.unitOfMeasure && (
          <h4 className="mx-auto text-red-700 font-serif">
            Unit of Measurement: {formError.unitOfMeasure}
          </h4>
        )}
        {IngredientsInputs}
        <div class="mb-3 mx-3 w-8 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-9 hover:text-teal-700 transition duration-200 ease-in-out"
            onClick={addIngredient}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="mb-3 w-96">
          <input
            class="form-control
                              block
                              w-full
                              px-3
                              mx-3
                              mt-2
                              py-1.5
                              text-base
                              font-normal
                              text-gray-700
                              bg-white bg-clip-padding
                              border border-solid border-gray-300
                              rounded
                              transition
                              ease-in-out
                              m-0
                              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            type="file"
            name="file"
            id="file"
            onChange={handleFileSelect}
          />
        </div>
        <div className="flex items-center justify-end p-6 rounded-b">
          <button
            className="bg-transparent text-red-500 hover:bg-red-700 hover:text-white font-bold uppercase text-sm px-6 py-3 rounded  hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
          >
            Cancel
          </button>
          <button
            className="bg-teal-900 text-white hover:bg-teal-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="submit"
            value="Create"
          >
            Create
          </button>
        </div>
      </form>
    </>
  );
};

export default RecipeForm;