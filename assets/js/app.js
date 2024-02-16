let cl = console.log;

const btnAddMovie = document.getElementById("btnAddMovie");
const backDrop = document.getElementById("backdrop");
const ourmodal = document.getElementById("ourmodal");
const cancel = [...document.querySelectorAll(".cancel")];
const movieForm = document.getElementById("movieForm");
const getTitle = document.getElementById("title");
const getUrl = document.getElementById("url");
const getRating = document.getElementById("rating");
const movieContainer = document.getElementById("movieContainer");
const addMovieBtn = document.getElementById("addMovieBtn");
const updateMovieBtn = document.getElementById("updateMovieBtn");
const loader = document.getElementById("loader");


let baseUrl = `https://movie-modal-firebase-default-rtdb.asia-southeast1.firebasedatabase.app`;

let postUrl = `${baseUrl}/posts.json`;
cl(baseUrl);

let ratingColor = (rating)=>{
    if(rating < 3.5){
        return "bg-danger"
    }else if(rating <= 4){
        return "bg-warning"
    }else if(rating > 4){
       return "bg-success"
    }
};

const onDeleteBtn = (eve) => {
	let getId = eve.closest(".card").id;
	let deleteUrl = `${baseUrl}/posts/${getId}.json`;
	makeApiCall("DELETE", deleteUrl)
		.then(res => {
			let card = document.getElementById(getId);
			Swal.fire({
                title: "Are you sure?",
                text: "You want to delete this post!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then((result) => {
                if (result.isConfirmed) {
                    card.remove();
                  Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                  });
                }
            });
		})
		.catch(err => cl(err))
		.finally(() => {
			loader.classList.add("d-none")
		})
}

const onEditBtn = (eve) => {
	let getId = eve.closest(".card").id;
	let editUrl = `${baseUrl}/posts/${getId}.json`;
	localStorage.setItem("getId", getId);
	makeApiCall("GET", editUrl)
		.then(res => {
			cl(res);
			getTitle.value = res.movieName;
			getUrl.value = res.movieUrl;
			getRating.value = res.movieRating;
			popupClick();
			addMovieBtn.classList.add("d-none");
			updateMovieBtn.classList.remove("d-none");
		})
		.catch(err => cl(err))
		.finally(() => {
			loader.classList.add("d-none")
		})
}

const popupClick = ()=>{
	backDrop.classList.toggle("d-none")
	ourmodal.classList.toggle("d-none")

};

const makeApiCall = (method, apiUrl, msgBody = null) => {
	return new Promise((resolve, reject) => {
		loader.classList.remove("d-none");
		let xhr = new XMLHttpRequest();
		xhr.open(method, apiUrl);
		xhr.send(JSON.stringify(msgBody));
		xhr.onload = function(){
			if(xhr.status >= 200 && xhr.status < 300){
				cl(xhr.response);
				resolve(JSON.parse(xhr.response));
			}else{
				reject(`Something went wrong`);
			}
		}
	})
}

const movieCard = (arr)=>{
	movieContainer.innerHTML = arr.map(m => {
		return `
		<div class="card carD m-2 ml-4" id = "${m.id}">
			<div class="card-header carDH p-2 d-flex justify-content-between align-items-center">
				
				<h5 class="mb-0">${m.movieName}</h5>
				<span class="${ratingColor(m.movieRating)} p-2 rating">${m.movieRating}</span>
				
			</div>
			<div class="card-body carDB p-0">
				<figure class="movieImg card-block mb-0">
					<img src="${m.movieUrl}" alt="movieImg">
				</figure>
				
			</div>
			<div class="card-footer carDF p-2 d-flex justify-content-between">
				<button class="btn btn-primary" onclick="onEditBtn(this)">Edit</button>
				<button class="btn btn-danger" onclick="onDeleteBtn(this)">Delete</button>
			</div>
		</div>
		`
	}).join("");
}

makeApiCall("GET", postUrl)
	.then(res => {
		cl(res);
		let postsArr = [];
		let object = res;
        for (const key in object) {
            let obj = {...object[key], id : key};
            postsArr.push(obj);
            movieCard(postsArr);
        }
	})
	.catch(err => cl(err))
	.finally(() => {
		loader.classList.add("d-none")
	})

const movieObj = (eve)=>{
	eve.preventDefault();
	
	let obj = {
		movieName : getTitle.value,
		movieUrl : getUrl.value,
		movieRating : getRating.value
	};

	makeApiCall("POST", postUrl, obj)
		.then(res => {
			popupClick();
			obj.id = res;
			let card = document.createElement("div");
			card.className = "card carD m-2";
			card.id.children = obj.id;
			card.innerHTML = `
			<div class="card-header carDH p-2 d-flex justify-content-between align-items-center">
				<h5 class="mb-0">${obj.movieName}</h5>
				<span class="${ratingColor(obj.movieRating)} p-2 rating">${obj.movieRating}</span>
			</div>
			<div class="card-body carDB p-0">
				<figure class="movieImg card-block mb-0">
					<img src="${obj.movieUrl}" alt="movieImg">
				</figure>
			</div>
			<div class="card-footer carDF p-2 d-flex justify-content-between">
				<button class="btn btn-primary" onclick="onEditBtn(this)">Edit</button>
				<button class="btn btn-danger" onclick="onDeleteBtn(this)">Delete</button>
			</div>
			
			`
			movieContainer.prepend(card);
			Swal.fire({
				title : `Movie added Successfully !!`,
				icon : "success"
			})
		})
		.catch(err => cl(err))
		.finally(() => {
			movieForm.reset();
			loader.classList.add("d-none")
		})
}

const updateCard = (eve) => {
	let obj = {
		movieName : getTitle.value,
		movieUrl : getUrl.value,
		movieRating : getRating.value
	}
	let getId = localStorage.getItem("getId");
	let updateUrl = `${baseUrl}/posts/${getId}.json`;
	makeApiCall("PATCH", updateUrl, obj)
		.then(res => {
			let card = [...document.getElementById(getId).children];
			card[0].innerHTML = `
				<h5 class="mb-0">${obj.movieName}</h5>
				<span class="${ratingColor(obj.movieRating)} p-2 rating">${obj.movieRating}</span>
			`
			card[1].innerHTML = `
				<figure class="movieImg card-block mb-0">
					<img src="${obj.movieUrl}" alt="movieImg">
				</figure>
			`
			Swal.fire({
				title : `Movie updated Successfully !!`,
				icon : "success"
			})
		})
		.catch(err => cl(err))
		.finally(() => {
			loader.classList.add("d-none");
			popupClick()
		})
}

cancel.forEach(eve=>{
	eve.addEventListener("click", popupClick);
})
movieForm.addEventListener("submit", movieObj);
btnAddMovie.addEventListener("click", popupClick);
updateMovieBtn.addEventListener("click", updateCard);