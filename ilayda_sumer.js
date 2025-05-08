(() => {
  const PRODUCTS_URL =
    "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
  const LOCAL_KEY = "carousel_products";
  const FAVORITES_KEY = "carousel_favorites";
  let data = [];
  let favorites = [];
  let scrollIndex = 0;
  const STEP = 262;

  async function init() {
    await fetchData();
    buildHTML();
    buildCSS();
    setEvents();
  }

  async function fetchData() {
    if (window.location.pathname !== "/") {
      console.log("wrong page");
      return;
    }
    data = JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    if (!data.length) {
      const res = await fetch(PRODUCTS_URL);
      data = await res.json();
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    }
    favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  }

  function buildHTML() {
    const section = document.createElement("section");
    section.id = "carousel-section";
    section.className = "banner";

    section.innerHTML = `
      <div class="container">
        <div class="banner__titles">
          <h2 class="title-primary">Beğenebileceğinizi düşündüklerimiz</h2>
        </div>
        <div class="banner__wrapper">
          <div class="carousel-track"></div>
          <button class="swiper-prev" aria-label="prev"></button>
          <button class="swiper-next" aria-label="next"></button>
        </div>
      </div>
    `;

    const track = section.querySelector(".carousel-track");
    data.forEach((item) => {
      const isFav = favorites.includes(item.id.toString());
      const rating = item.rating || 0;
      const hasDiscount = item.original_price > item.price;
      const discountRate = hasDiscount
        ? Math.round(
            ((item.original_price - item.price) / item.original_price) * 100
          )
        : 0;

      const card = document.createElement("div");
      card.className =
        "ins-product-box ins-element-link ins-add-to-cart-wrapper ins-sr-api";
      card.innerHTML = `
        <a class="product-item-anchor" href="${item.url}" target="_blank">
          <figure class="product-item__img">
            <div class="product-item__multiple-badge">
              <img src="https://www.e-bebek.com/assets/images/cok-satan.png" alt="Badge">
            </div>
            <img src="${item.img}" alt="${item.name}">
          </figure>
          <div class="product-item-content">
            <h2 class="product-item__brand"><b>${item.brand} - </b><span>${
        item.name
      }</span></h2>
            <div class="stars-wrapper">
              ${[...Array(5)]
                .map(
                  (_, i) =>
                    `<span class="star ${i < rating ? "filled" : ""}">★</span>`
                )
                .join("")}
              <span class="review-count">(${item.reviews || 0})</span>
            </div>
            <div class="product-item__price">
              ${
                hasDiscount
                  ? `<span class="product-item__old-price">${item.original_price.toFixed(
                      2
                    )} TL</span>
                     <span class="carousel-product-price-percent">%${discountRate}</span>`
                  : ""
              }
              <span class="product-item__new-price">${item.price.toFixed(
                2
              )} TL</span>
            </div>
            <div class="product-list-promo"><p>Sepette ${(
              item.price * 0.8
            ).toFixed(2)} TL</p></div>
          </div>
        </a>
        <div class="heart" data-id="${item.id}">
          <img class="heart-icon default" src="/assets/svg/default-favorite.svg">
          <img class="heart-icon hovered" src="/assets/svg/default-hover-favorite.svg">
        </div>
        <button class="btn close-btn">Sepete Ekle</button>
      `;
      track.appendChild(card);

      const [defIcon, hovIcon] = card.querySelectorAll(".heart-icon");
      defIcon.style.display = isFav ? "none" : "block";
      hovIcon.style.display = isFav ? "block" : "none";
    });

    const target = document.querySelector("eb-home-page") || document.body;
    target.appendChild(section);
  }

  function buildCSS() {
    const css = `
      #carousel-section { margin: 30px 0; }
      #carousel-section .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
      #carousel-section .banner__titles .title-primary { font-size: 1.5rem; margin-bottom: 1rem; }
      #carousel-section .banner__wrapper { position: relative; overflow: hidden; }
      #carousel-section .carousel-track { display: flex; gap: 20px; transition: transform 0.5s ease; will-change: transform; }
      #carousel-section .swiper-prev,
      #carousel-section .swiper-next {
        position: absolute; top: 50%; transform: translateY(-50%);
        width: 40px; height: 40px; border-radius: 50%; border: none;
        background-color: #fef6eb; background-repeat: no-repeat;
        background-position: center; background-size: 20px 20px; cursor: pointer;
      }
      #carousel-section .swiper-prev { left: -20px; background-image: url('/assets/svg/prev.svg'); }
      #carousel-section .swiper-next { right: -20px; background-image: url('/assets/svg/next.svg'); }
      #carousel-section .ins-product-box {
        width: 242px; flex: 0 0 auto; border: 1px solid #ededed;
        border-radius: 10px; background: #fff; padding: 12px;
        font-family: Quicksand, sans-serif; position: relative;
      }
      #carousel-section .product-item__img img { width: 100%; border-radius: 8px; }
      #carousel-section .stars-wrapper { display: flex; align-items: center; margin-bottom: 0.5rem; }
      #carousel-section .star.filled { color: #ffb400; }
      #carousel-section .review-count { margin-left: 0.25rem; font-size: 0.875rem; }
      #carousel-section .product-item__old-price { text-decoration: line-through; color: #999; margin-right: 0.5rem; }
      #carousel-section .carousel-product-price-percent { color: #f60; margin-left: 0.5rem; }
      #carousel-section .product-item__new-price { font-weight: bold; }
      #carousel-section .product-list-promo p { margin-top: 0.5rem; font-size: 0.875rem; color: #777; }
      #carousel-section .heart { position: absolute; top: 10px; right: 15px; cursor: pointer; }
      #carousel-section .heart-icon { width: 24px; height: 24px; display: block; }
      #carousel-section .heart-icon.hovered { display: none; }
      #carousel-section .btn.close-btn {
        width: 100%; background: rgba(255,255,255,0.3); color: #f60;
        border: 1px solid #f60; border-radius: 20px; padding: 10px;
        font-weight: bold; margin-top: 10px; cursor: pointer;
      }
    `;
    const styleEl = document.createElement("style");
    styleEl.className = "carousel-style";
    styleEl.innerHTML = css;
    document.head.appendChild(styleEl);
  }

  function setEvents() {
    document.querySelectorAll("#carousel-section .heart").forEach((heart) => {
      heart.addEventListener("click", (e) => {
        e.preventDefault();
        const id = heart.dataset.id;
        let favs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        const [defIcon, hovIcon] = heart.querySelectorAll(".heart-icon");
        if (favs.includes(id)) {
          favs = favs.filter((x) => x !== id);
          defIcon.style.display = "block";
          hovIcon.style.display = "none";
        } else {
          favs.push(id);
          defIcon.style.display = "none";
          hovIcon.style.display = "block";
        }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
      });
    });

    const track = document.querySelector("#carousel-section .carousel-track");
    document
      .querySelector("#carousel-section .swiper-prev")
      .addEventListener("click", () => {
        scrollIndex = Math.max(scrollIndex - 1, 0);
        track.style.transform = `translateX(-${scrollIndex * STEP}px)`;
      });
    document
      .querySelector("#carousel-section .swiper-next")
      .addEventListener("click", () => {
        const maxIndex = data.length - 1;
        scrollIndex = Math.min(scrollIndex + 1, maxIndex);
        track.style.transform = `translateX(-${scrollIndex * STEP}px)`;
      });
  }

  init();
})();
