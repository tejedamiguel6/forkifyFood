import { elements } from './base';
import { createInflate } from 'zlib';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
}


export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};



export const highlightedSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el=> {
        el.classList.remove('results__link--active');
    });

    document.querySelector(`a[href="#${id}"]`).classList.add('results__link--active');
}

//'Pasta with tomato with spinach'
/*
acc: + cur.length = 5 / newTitle = ['Pasta']
acc: + cur.length = 9 / newTitle = ['Pasta' 'with']
*/
const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length > limit){
        title.split(' ').reduce((acc, cur)=> {
            if(acc + cur.length <= limit){
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);
        //return the result
        return `${newTitle.join(' ')}...`;
    }else {
        return title;
    }
}

const renderRecipe = recipe => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
}


//type: 'prev' or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>

        </svg>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    </button>
`;


const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button; 

    if(page === 1 && pages > 1){
        //Only button to go to the next page
       button = createButton(page, 'next');

    } else if(page < pages) {
        button = `
        ${createButton(page, 'next')}
        ${createButton(page, 'prev')}
        `;
        //Both bbuttons
    }
    else if (page === pages && pages > 1) {
        button = createButton(page, 'Prev');
        //only button to go to prev pages
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);

};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results of current page 
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);
    //render pagination button
    renderButtons(page, recipes.length, resPerPage);
};

