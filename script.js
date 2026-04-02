const orderForm = document.getElementById("orderForm");
const formMessage = document.getElementById("formMessage");
const revealBlocks = document.querySelectorAll(".reveal");
const packageSelect = document.getElementById("packageSelect");
const photoInput = document.getElementById("photoInput");
const photoFilename = document.getElementById("photoFilename");
const uploadHint = document.getElementById("uploadHint");

// Важно для дебага: любые "обязательные" элементы проверяем перед использованием,
// чтобы один отсутствующий блок не ломал весь JS на странице.
const submitButton = orderForm ? orderForm.querySelector(".submit-btn") : null;
const submitDefaultText = submitButton ? submitButton.textContent : "";

const placeholderSvgDataUrl = (() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#121a33"/>
          <stop offset="0.55" stop-color="#0b1023"/>
          <stop offset="1" stop-color="#151d3a"/>
        </linearGradient>
        <radialGradient id="r" cx="30%" cy="25%" r="65%">
          <stop offset="0" stop-color="rgba(142,166,255,0.35)"/>
          <stop offset="1" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#g)"/>
      <rect width="1200" height="900" fill="url(#r)"/>
      <g opacity="0.95">
        <path d="M120 510 Q320 280 520 510 T920 510" fill="none" stroke="rgba(140,240,220,0.55)" stroke-width="2"/>
        <path d="M200 565 Q360 400 520 565 T840 565" fill="none" stroke="rgba(214,191,142,0.45)" stroke-width="2"/>
        <circle cx="520" cy="510" r="7" fill="rgba(236,241,255,0.85)"/>
      </g>
      <text x="70" y="140" fill="rgba(236,241,255,0.92)" font-family="Manrope, Arial, sans-serif" font-size="44" font-weight="800">
        Фото скоро появится
      </text>
      <text x="70" y="205" fill="rgba(182,193,228,0.9)" font-family="Manrope, Arial, sans-serif" font-size="28" font-weight="600">
        Добавьте файлы из папки images по README.txt
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

if (orderForm && formMessage && submitButton) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const selectedPackage = String(formData.get("package") || "").trim();

    if (!name || !contact || !selectedPackage) {
      formMessage.textContent = "Заполните, пожалуйста, имя, контакт и пакет.";
      formMessage.style.color = "#ffb3b3";
      return;
    }

    // Фото пока НЕ делаем обязательным (часто люди хотят уточнить до отправки).
    // Но если файл выбран — можно подсветить базовые ошибки (тип/размер).
    const file = photoInput && photoInput.files ? photoInput.files[0] : null;
    if (file) {
      const maxBytes = 12 * 1024 * 1024; // 12MB
      const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      if (!okType) {
        formMessage.textContent = "Фото должно быть JPG, PNG или WEBP.";
        formMessage.style.color = "#ffb3b3";
        return;
      }
      if (file.size > maxBytes) {
        formMessage.textContent = "Фото слишком большое. Попробуйте файл до 12 МБ.";
        formMessage.style.color = "#ffb3b3";
        return;
      }
    }

    submitButton.disabled = true;
    submitButton.textContent = "Отправляем...";

    setTimeout(() => {
      formMessage.textContent = "Заявка отправлена! Мы свяжемся с вами в ближайшее время.";
      formMessage.style.color = "#50e3c2";
      orderForm.reset();
      submitButton.disabled = false;
      submitButton.textContent = submitDefaultText;
    }, 700);
  });
}

if (photoInput && photoFilename) {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0] ? photoInput.files[0] : null;
    photoFilename.textContent = file ? file.name : "Файл не выбран";

    if (uploadHint) {
      if (!file) {
        uploadHint.textContent = "JPG/PNG, 1 файл";
      } else {
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        uploadHint.textContent = `${file.type || "image"} • ${mb} MB`;
      }
    }
  });
}

function selectPackageAndGo(value) {
  if (!packageSelect) return;

  packageSelect.value = value;

  const orderSection = document.getElementById("order");
  if (orderSection) {
    orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  requestAnimationFrame(() => {
    packageSelect.focus({ preventScroll: true });
  });
}

document.querySelectorAll(".choose-package").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.getAttribute("data-package");
    if (value) selectPackageAndGo(value);
  });
});

document.querySelectorAll(".price-card.is-clickable").forEach((card) => {
  card.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("button, a, input, select, textarea")) return;

    const value = card.getAttribute("data-package");
    if (value) selectPackageAndGo(value);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const value = card.getAttribute("data-package");
    if (value) selectPackageAndGo(value);
  });
});

document.querySelectorAll("img.smart-image").forEach((img) => {
  img.addEventListener("error", () => {
    if (img.getAttribute("data-has-fallback") === "1") return;
    img.setAttribute("data-has-fallback", "1");
    img.src = placeholderSvgDataUrl;
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealBlocks.forEach((block) => revealObserver.observe(block));
} else {
  // Фоллбек: старые браузеры просто показывают блоки без анимации.
  revealBlocks.forEach((block) => block.classList.add("is-visible"));
}

// Плавная прокрутка для ссылок-якорей (#order, #packages, #examples и т.д.)
function setupSmoothAnchors() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Делаем фокус для доступности (клавиатура/скринридеры)
      if (target instanceof HTMLElement) {
        requestAnimationFrame(() => {
          target.focus?.({ preventScroll: true });
        });
      }
    });
  });

  // Если страница открылась сразу с хешем — скроллим к нужному месту
  const { hash } = window.location;
  if (hash && hash !== "#") {
    const target = document.querySelector(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }
}

setupSmoothAnchors();
