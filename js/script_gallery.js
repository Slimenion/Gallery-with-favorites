//функция получения http request по ссылке
function getHttpRequest(request_url) {
    let httpReq = new XMLHttpRequest();
    httpReq.open("GET", request_url, false);
    httpReq.send(null);
    return httpReq.responseText;
}

//функция удаления из избранного
function remToFavorite(e) {
    const currentElem = e.target;
    userFavorite.splice(
        userFavorite.indexOf(currentElem.parentNode.id.split("_")[1]),
        1
    );
    let elem = document.querySelector(
        "#image_" + currentElem.parentNode.id.split("_")[1]
    );
    elem.classList.remove("hover_image");
    elem.querySelector(".image_star").src = "img/star_empty.png";
    currentElem.parentNode.parentNode.remove();
}

//функция выбора другой вкладки
function makeHover(e) {
    //проверяем какая клавиша сейчас активна
    const currentElem = e.target;
    if (!currentElem.classList.contains("hover")) {
        const alterCurrentButton = currentElem.previousSibling.previousSibling;
        const favoriteButton = document.querySelector(".favorite");
        const catalogButton = document.querySelector(".catalog");
        if (alterCurrentButton) {
            //попалось избранное
            //переключаем кнопку и скрываем каталог
            alterCurrentButton.classList.remove("hover");
            currentElem.classList.add("hover");
            catalogButton.style.display = "none";
            favoriteButton.style.display = "block";
            //проверяем есть ли вообще избранные фото
            if (userFavorite.length == 0) {
                //избранных нет, вставляем заглушку
                document.querySelector("#empty").style.display = "block";
                const oldFavorites = document.querySelectorAll(".fav_image");
                oldFavorites.forEach((elem) => {
                    elem.parentNode.remove();
                });
            } else {
                //стираем
                const oldFavorites = document.querySelectorAll(".fav_image");
                oldFavorites.forEach((elem) => {
                    if (!userFavorite.includes(elem.id.split("_")[1])) {
                        elem.parentNode.remove();
                    }
                });
                //загружаем новые элементы
                document.querySelector("#empty").style.display = "none";
                const favoriteImageTemplate =
                    document.querySelector("#favorite_image");
                const image =
                    favoriteImageTemplate.content.querySelector(".image_main");
                const titleImage =
                    favoriteImageTemplate.content.querySelector("p");
                const favoriteImages = document.querySelector(
                    ".favorite_images_hover"
                );
                userFavorite.forEach((elem) => {
                    if (
                        !document.querySelector("#image_" + elem + "_favorite")
                    ) {
                        let currentImage = document.querySelector(
                            "#image_" + elem
                        );
                        image.title = currentImage.title;
                        image.id = currentImage.id + "_favorite";
                        image.style = currentImage.style.cssText;
                        titleImage.textContent = currentImage.title;
                        let favImage =
                            favoriteImageTemplate.content.cloneNode(true);

                        favoriteImages.append(favImage);
                        let curElem = document.querySelector("#" + image.id);
                        curElem.addEventListener("click", loadFullImage);
                        curElem
                            .querySelector(".image_star")
                            .addEventListener("click", remToFavorite);
                    }
                });
            }
        } else {
            //попался каталог
            currentElem.nextSibling.nextSibling.classList.remove("hover");
            currentElem.classList.add("hover");
            document.querySelector(".favorite").style.display = "none";
            catalogButton.style.display = "block";
        }
    }
}

//функция показа изображения во весь экран
function loadFullImage(e) {
    const currentElem = e.target;
    const idImage = currentElem.id.split("_")[1];
    if (!!idImage) {
        const fullImageTemplate = document.querySelector("#image_full");
        const image = fullImageTemplate.content
            .querySelector(".image_full")
            .querySelector(".image");
        let imageJson = JSON.parse(
            getHttpRequest("https://json.medrating.org/photos?id=" + idImage)
        );
        image.src = imageJson[0].url;
        let fullImage = fullImageTemplate.content.cloneNode(true);
        document.querySelector("body").append(fullImage);
        document
            .querySelector(".image_full")
            .querySelector(".close")
            .addEventListener("click", (e) => {
                e.target.parentNode.remove();
            });
    }
}

//функция изменения списка избранного
function addToFavorite(e) {
    const currentElem = e.target;
    if (currentElem.src.includes("/img/star_active.png")) {
        currentElem.parentNode.classList.remove("hover_image");
        userFavorite.splice(
            userFavorite.indexOf(currentElem.parentNode.id.split("_")[1]),
            1
        );
        currentElem.src = "img/star_empty.png";
    } else {
        currentElem.parentNode.classList.add("hover_image");
        userFavorite.push(currentElem.parentNode.id.split("_")[1]);
        currentElem.src = "img/star_active.png";
    }
}

//функция загрузки изображений из альбома
function loadImagesAlbom(e) {
    const currentElem = e.target;
    //получаем пользователя и альбом
    const user = currentElem.parentNode.parentNode.parentNode;
    const albom = currentElem.parentNode.nextSibling.nextSibling;
    let images = user.querySelectorAll(".image_main");
    //получаем шаблон
    const userImagesTemplate = document.querySelector("#images_user");
    //проверяем нажата или отжата кнопка
    if (currentElem.src.includes("/img/Close.svg")) {
        currentElem.src = "img/Open.svg";
        albom.style.display = "none";
    } else {
        if (images.length == 0) {
            const albomId = user.id.split("_")[1];
            let userImages = JSON.parse(
                getHttpRequest(
                    "https://json.medrating.org/photos?albumId=" + albomId
                )
            );
            userImages.forEach((img) => {
                const image =
                    userImagesTemplate.content.querySelector(".image_main");
                image.title = img.title;
                image.id = "image_" + img.id;
                image.style = `background-image: url('${img.thumbnailUrl}');`;

                let newImage = userImagesTemplate.content.cloneNode(true);
                albom.append(newImage);
                let curElem = document.querySelector("#image_" + img.id);
                curElem.addEventListener("click", loadFullImage);
                curElem
                    .querySelector(".image_star")
                    .addEventListener("click", addToFavorite);
            });
        }
        albom.style.display = "grid";
        currentElem.src = "img/Close.svg";
    }
}

//функция загрузки альбомов пользователя
function loadAldomsUser(e) {
    const currentElem = e.target;
    //Получаем нужного нам пользователя
    const user = currentElem.parentNode.parentNode;
    //Получаем шаблон для создания заголовка альбома
    const userAlbomsTemplate = document.querySelector("#albom_user");
    //Получаем заголовки альбомов пользователя
    let alboms = user.querySelectorAll(".albom_user");
    //проверяем нажата или отжата кнопка
    if (currentElem.src.includes("/img/Close.svg")) {
        //кнопка разжата, сворачиваем ее
        currentElem.src = "img/Open.svg";
        alboms.forEach(function (userItem) {
            userItem.style.display = "none";
        });
    } else {
        //кнопка сжата разжимаем ее
        //если мы уже показывали альбом, то просто показываем его, иначе загружаем
        if (!(alboms.length == 0)) {
            alboms.forEach((elem) => {
                elem.style.display = "block";
            });
        } else {
            //получаем id пользователя
            const userId = user.id.split("_")[1];
            //получаем список альбомов пользователя
            let userAlboms = JSON.parse(
                getHttpRequest(
                    "https://json.medrating.org/albums?userId=" + userId
                )
            );
            //Добавляем альбомы
            userAlboms.forEach((albom) => {
                const nameAlbom =
                    userAlbomsTemplate.content.querySelector("span");
                const idAlbom =
                    userAlbomsTemplate.content.querySelector(".albom_user");
                idAlbom.id = "albom_" + albom.id;
                nameAlbom.textContent = albom.title;
                let newAlbom = userAlbomsTemplate.content.cloneNode(true);
                user.append(newAlbom);
                //Добавляем обработчик для загрузки изображений из альбома
                document
                    .querySelector("#albom_" + albom.id)
                    .querySelector("img")
                    .addEventListener("click", loadImagesAlbom);
            });
        }
        currentElem.src = "img/Close.svg";
    }
}

//функция загрузки пользователей
function loadUsers() {
    //получаем массив пользователей
    let users = JSON.parse(getHttpRequest("https://json.medrating.org/users/"));
    //получаю шаблон для пользователя
    const catalog = document.querySelector(".catalog");
    //создаем заголовки для каждого пользователя
    users.forEach((user) => {
        const userTemplate = document.querySelector("#user");
        const nameUser = userTemplate.content.querySelector("p");
        const idUser = userTemplate.content.querySelector(".user");

        idUser.id = "user_" + user.id;
        nameUser.textContent = user.name;

        let newUser = userTemplate.content.cloneNode(true);
        catalog.append(newUser);

        //добавляем обработчик события на изображение
        document
            .getElementById("user_" + user.id)
            .querySelector("img")
            .addEventListener("click", loadAldomsUser);
    });
}

//инициализации списка избранного
let userFavorite = [];

//инициализация функций для кнопок навигации
let favoriteButton = document.querySelector("#favorite_button");
let catalogButton = document.querySelector("#catalog_button");
favorite_button.addEventListener("click", makeHover);
catalog_button.addEventListener("click", makeHover);

//начальная загрузка пользователей в каталоге
loadUsers();
