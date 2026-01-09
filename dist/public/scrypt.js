document.addEventListener("DOMContentLoaded", () => {

  // ===== Highlight des liens "À lire aussi" =====
  const relatedLinks = document.querySelectorAll(".related-articles a");

  relatedLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      link.style.textDecoration = "underline";
    });

    link.addEventListener("mouseleave", () => {
      link.style.textDecoration = "none";
    });
  });

  // ===== Détection de fin de lecture =====
  const article = document.querySelector(".article");

  if (!article) return;

  let suggestionShown = false;

  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const triggerPoint = article.offsetTop + article.offsetHeight * 0.8;

    if (!suggestionShown && scrollPosition >= triggerPoint) {
      suggestionShown = true;
      showReadingSuggestion();
    }
  });

  function showReadingSuggestion() {
    const relatedSection = document.querySelector(".related-articles");
    if (!relatedSection) return;

    relatedSection.style.border = "2px solid #2563eb";
    relatedSection.style.borderRadius = "6px";
    relatedSection.style.padding = "1.5rem";

    const hint = document.createElement("p");
    hint.textContent = "👉 Continue ta lecture avec un article lié";
    hint.style.color = "#2563eb";
    hint.style.fontWeight = "600";
    hint.style.marginBottom = "0.8rem";

    relatedSection.prepend(hint);
  }

});
