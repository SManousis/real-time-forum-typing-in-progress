import { fetchBootstrapData } from "./mock-api-calls.js";
import { globalState } from "./script.js"
import * as utils from "./utils.js"
import { fetchJwt } from "./jwt_fetch.js"

export async function fetchCategories(data) {
  const cats = globalState.categories;

  // Mock ===========================
  // const mock = await fetchBootstrapData();
  // const data = mock.categoriesMockApi
  // data.categories.forEach(category => {
  //   const categoryId = category.id;
  //   cats.byId[categoryId] = category;
  //   cats.allIds.push(categoryId);
  //   newIds.push(categoryId);
  // });
  // renderCategories(newIds);

  // Real call
  try {
    const res = await fetchJwt(
      `/categories`,
      { method: "GET" }
    )
    const data = await res.json();
    const newIds = [];
    if (!data.categories) return
    data.categories.forEach(category => {
      const categoryId = category.id;
      cats.byId[categoryId] = category;
      cats.allIds.push(categoryId);
      newIds.push(categoryId);
    });
    renderCategories(newIds);
  } catch (err) {
    console.log(err)
    utils.showAlert("failed to fetch categories", undefined, 3000, 'red')
    return;
  }

}


function renderCategories(newIds) {
  const cats = globalState.categories;
  const containerHome = document.getElementById("categories-container");
  const containerNewPost = document.getElementById("categories-selection-on-new-post");
  containerHome.innerHTML = "";
  containerNewPost.innerHTML = "";
  newIds.forEach(id => {
    const linkHome = createCategoryItemHome(cats.byId[id])
    containerHome.appendChild(linkHome);
    const linkPost = createCategoryItemPost(cats.byId[id])
    containerNewPost.appendChild(linkPost);
  });
}


function createCategoryItemHome(category) {
  const link = document.createElement("a");
  link.href = "#";
  link.className = "category-item";
  link.dataset.category = category.name;
  link.dataset.id = category.id;
  link.textContent = category.name;

  return link;
}

function createCategoryItemPost(category) {
  const link = document.createElement("a");
  // link.href = "#";
  link.className = "category-tag";
  link.dataset.category = category.name;
  link.dataset.id = category.id;
  link.textContent = category.name;

  link.addEventListener("click", (e) => {
    if (e.target.classList.contains("category-tag")) {
      const category = e.target.dataset.id;
      e.target.classList.toggle("selected");
      if (e.target.classList.contains("selected")) {
        if (!globalState.categories.selectedOnPost.includes(category)) globalState.categories.selectedOnPost.push(category);
      } else {
        globalState.categories.selectedOnPost = globalState.categories.selectedOnPost.filter(c => c !== category);
      }
    }
  })
  return link;
}

