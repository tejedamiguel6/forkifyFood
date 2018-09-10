import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import { WSAEINVALIDPROVIDER } from 'constants';

// GLobal state of the app
// Search object
// current recipe object
// shopping list object
// liked recipes

const state = {}
window.state = state;

// Search controller

const controlSearch = async () => {
    // 1. get query from the view
    const query = searchView.getInput() //TODO
        

    console.log(query)

        if(query){
            //2 New search objec and add state
            state.search = new Search(query);

            //3. Prepare UI for results
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);

            try {
                //4. Search for recipes
                await state.search.getResults();

                //5. render results on the UI
                clearLoader();
                searchView.renderResults(state.search.result); 

            } catch(err){
            alert('Something went wrong with the search');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


//RECIPE CONTROLLER

const controlRecipe = async () => {
    // Get ID from the url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id) {
        //Prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item 
        if (state.search) searchView.highlightedSelected(id);
        //Create new recipe object
        state.recipe = new Recipe(id);
        
        try {
            //Get recipe data from the server and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngreds();

            //calculate servins and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render the recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert('Error processing recipe');
        }
   
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


// LISt CONTROLLER

const controlList = () => {
    //create a new list f there is none yet
    if(!state.list)
        state.list = new List();

        //Add each ingredient to the list and user interface
        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        });

    
}


// Handle delete and update list
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete 
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

       
        //Handle the count update
    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


// LIKE CONTROLLER

//TETSTING
state.likes = new Likes();

const controlLike =() => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //USER HAS NOT yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //Toggle the like button 
        likesView.toggleLikeBtn(true);


        // Add like to the UI list

        console.log(state.likes);

    //USER HAS liked current recipe
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);
        //Toggle the like button 
        likesView.toggleLikeBtn(false);


        // remove like from the UI list
        console.log(state.likes);
    }
}


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1 ){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe)
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe)

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //ADD ingredients to the shopping list 
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});

window.l = new List();