// ================= FIREBASE =================
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// ================= ELEMENTS =================
const modal = document.getElementById("auth-modal");
const blurBg = document.getElementById("blur-bg");

// Navbar buttons
const loginBtn = document.querySelector(".login-btn");
const signupBtn = document.querySelector(".signup-btn");
const getStartedBtn = document.querySelector(".get-started");
const closeBtn = document.querySelector(".close-modal");

// Auth forms
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const goSignup = document.getElementById("go-signup");
const goLogin = document.getElementById("go-login");

// Contact popup


// ================= AUTH MODAL OPEN =================

// SAFE event binding (null check ke sath)
loginBtn && loginBtn.addEventListener("click", () => {
  showLogin();
});

signupBtn && signupBtn.addEventListener("click", () => {
  showSignup();
});

getStartedBtn && getStartedBtn.addEventListener("click", () => {
  showLogin();
});

// ---------------- FUNCTIONS ----------------

function showLogin() {
  if (!loginForm || !signupForm) return;

  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  openAuthModal();
}

function showSignup() {
  if (!loginForm || !signupForm) return;

  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  openAuthModal();
}

function openAuthModal() {
  if (!modal || !blurBg) return;

  modal.classList.add("active");
  blurBg.classList.add("active");
  document.body.style.overflow = "hidden";
}



// ================= FORM SWITCH =================
goSignup.addEventListener("click", (e) => {
  e.preventDefault();
  showSignup();
});

goLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});


// ================= CLOSE MODALS =================
closeBtn.addEventListener("click", closeAll);
blurBg.addEventListener("click", closeAll);

function closeAll() {
  modal && modal.classList.remove("active");
  blurBg && blurBg.classList.remove("active");
  document.body.style.overflow = "auto";
}

// ================= CONTACT FORM EMAIL (FINAL & LIVE) =================

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // ✅ Instant user feedback
    alert("✅ Your message has been sent successfully! We’ll contact you soon.");

    emailjs.sendForm(
      "service_erb2xak",        // ✅ YOUR SERVICE ID
      "template_n1ib47k",       // ❗ yahan apni template ID paste kar
      this
    )
    .then(() => {
      // ✅ Clear form after success
      contactForm.reset();
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      alert("❌ Something went wrong. Please try again later.");
    });
  });
}


// ================= CONTACT POPUP =================



// ================= CONTACT FORM =================



// ================= NAVBAR SCROLL =================
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });

    document.querySelectorAll(".nav-links a")
      .forEach(a => a.classList.remove("active"));
    this.classList.add("active");
  });
});

window.addEventListener("load", () => {
  document.querySelector(".nav-links a[href='#hero']")?.classList.add("active");
});


// ================= FIREBASE SIGNUP =================
document
  .querySelector("#signup-form .modal-btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm").value;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      // ✅ NAME SAVE ONLY HERE
      await updateProfile(userCredential.user, {
        displayName: name
      });

      alert("Signup successful 🎉");
      window.location.href = "dashboard.html";

    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });



// ================= FIREBASE LOGIN =================
document
  .querySelector("#login-form .modal-btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const userCredential =
        await signInWithEmailAndPassword(auth, email, password);

      alert("Login successful ✅");
      console.log("User:", userCredential.user);

      window.location.href = "dashboard.html";

    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });

  // ================= HERO IMAGE SLIDER =================

const heroImages = [
  "assets/hero1.svg",
  "assets/hero2.svg",
  "assets/hero3.svg",
  "assets/hero4.svg"
];

let currentHeroIndex = 0;
const heroImg = document.getElementById("hero-slider");

if (heroImg) {
  setInterval(() => {
    // fade out
    heroImg.style.opacity = "0";

    setTimeout(() => {
      // next image index
      currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;

      // change image
      heroImg.src = heroImages[currentHeroIndex];

      // fade in
      heroImg.style.opacity = "1";
    }, 500);

  }, 3000);
}

// ================= ABOUT IMAGE SLIDER =================

const aboutImages = [
  "assets/about1.svg",
  "assets/about2.svg",
  "assets/about3.svg",
  "assets/about4.svg"
];

let currentAboutIndex = 0;
const aboutImg = document.getElementById("about-slider");

if (aboutImg) {
  setInterval(() => {
    // fade out
    aboutImg.style.opacity = "0";

    setTimeout(() => {
      // next image
      currentAboutIndex = (currentAboutIndex + 1) % aboutImages.length;
      aboutImg.src = aboutImages[currentAboutIndex];

      // fade in
      aboutImg.style.opacity = "1";
    }, 500);

  }, 3500);
}

// ===== FEATURES CENTER CARD DETECTION (STABLE) =====

const featuresContainer = document.querySelector(".features-scroll");
const featureCards = document.querySelectorAll(".feature-card");

if (featuresContainer && featureCards.length > 0) {

  function updateActiveCard() {
    const containerCenter =
      featuresContainer.scrollLeft +
      featuresContainer.clientWidth / 2;

    let closestCard = null;
    let minDistance = Infinity;

    featureCards.forEach(card => {
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    featureCards.forEach(card => card.classList.remove("active"));
    if (closestCard) closestCard.classList.add("active");
  }

  featuresContainer.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateActiveCard);
  });

  updateActiveCard(); // initial
}

// ===== FEATURES SAFE AUTO SCROLL =====

let autoScrollInterval;
let isUserInteracting = false;

function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    if (isUserInteracting) return;

    featuresContainer.scrollBy({
      left: 320,
      behavior: "smooth"
    });

    // end pe pahunchne par soft reset
    if (
      featuresContainer.scrollLeft + featuresContainer.clientWidth >=
      featuresContainer.scrollWidth - 10
    ) {
      setTimeout(() => {
        featuresContainer.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      }, 800);
    }
  }, 2500);
}

// user interaction detect
// ===== FEATURES SAFE AUTO SCROLL (NULL SAFE) =====

if (featuresContainer) {

  let isUserInteracting = false;

  function startAutoScroll() {
    setInterval(() => {
      if (isUserInteracting) return;

      featuresContainer.scrollBy({
        left: 320,
        behavior: "smooth"
      });

      if (
        featuresContainer.scrollLeft + featuresContainer.clientWidth >=
        featuresContainer.scrollWidth - 10
      ) {
        featuresContainer.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      }
    }, 2500);
  }

  featuresContainer.addEventListener("mouseenter", () => {
    isUserInteracting = true;
  });

  featuresContainer.addEventListener("mouseleave", () => {
    isUserInteracting = false;
  });

  featuresContainer.addEventListener("touchstart", () => {
    isUserInteracting = true;
  });

  featuresContainer.addEventListener("touchend", () => {
    isUserInteracting = false;
  });

  startAutoScroll();
}


featuresContainer.addEventListener("mouseleave", () => {
  isUserInteracting = false;
});

featuresContainer.addEventListener("touchstart", () => {
  isUserInteracting = true;
});

featuresContainer.addEventListener("touchend", () => {
  isUserInteracting = false;
});

// start auto scroll
startAutoScroll();

window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("active");
};

window.loginWithGoogle = loginWithGoogle;

function loginWithGoogle() {

  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {

      const user = result.user;
      console.log(user);

      alert("Google Login Successful ✅");

      window.location.href = "dashboard.html";

    })
    .catch((error) => {
      alert(error.message);
    });
}
