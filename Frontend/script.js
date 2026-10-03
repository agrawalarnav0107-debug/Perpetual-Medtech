/* PERPETUAL MEDTECH - MAIN JAVASCRIPT */


/* 1. PAGE LOAD */
const API_BASE_URL = "https://perpetual-medtech.vercel.app";

document.addEventListener("DOMContentLoaded", function () {

    console.log("Perpetual Medtech website loaded successfully.");

});


/* 2. MOBILE NAVIGATION */

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", function () {

        navLinks.classList.toggle("active");

    });

}


/* 3. CLOSE MOBILE NAVIGATION AFTER CLICKING A LINK */

if (navLinks) {

    const navigationLinks = navLinks.querySelectorAll("a");

    navigationLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

        });

    });

}


/* 4. NAVBAR SCROLL EFFECT */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", function () {

    if (!navbar) {
        return;
    }

    if (window.scrollY > 50) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});


/* 5. SCROLL PROGRESS BAR */

const scrollProgress = document.querySelector(".scroll-progress");

window.addEventListener("scroll", function () {

    if (!scrollProgress) {
        return;
    }

    const scrollTop = window.scrollY;

    const documentHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    if (documentHeight <= 0) {
        return;
    }

    const scrollPercentage =
        (scrollTop / documentHeight) * 100;

    scrollProgress.style.width =
        scrollPercentage + "%";

});


/* 6. SCROLL REVEAL ANIMATION */

const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
);

if (revealElements.length > 0) {

    const revealObserver = new IntersectionObserver(
        function (entries, observer) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    revealElements.forEach(function (element) {

        revealObserver.observe(element);

    });

}


/* 7. SMOOTH SCROLLING */

const smoothScrollLinks = document.querySelectorAll(
    'a[href^="#"]'
);

smoothScrollLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId =
            link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const targetElement =
            document.querySelector(targetId);

        if (!targetElement) {
            return;
        }

        event.preventDefault();

        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


/* LOAD PRODUCTS FROM FASTAPI + POSTGRESQL */

const productsGrid = document.getElementById("productsGrid");

async function loadProducts() {

    if (!productsGrid) {
        console.warn("productsGrid element was not found.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/products`
        );

        if (!response.ok) {
            throw new Error(
                "Product API returned HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log("Product API response:", data);

        if (
            data.status !== "success" ||
            !Array.isArray(data.products)
        ) {
            throw new Error("Invalid product data received.");
        }

        /* Clear the product grid */
        productsGrid.innerHTML = "";

        /* Create products */
        data.products.forEach(function (product) {

    const productCard = document.createElement("article");

    productCard.className = "product-card";


    /* GET ONLY THE IMAGE FILE NAME */

    const fileName = product.image_url
        .split("/")
        .pop()
        .trim();


    /* BUILD CORRECT FRONTEND IMAGE URL */

    const imagePath =
        window.location.origin +
        "/Images/products/" +
        fileName;


    console.log(
        "Database image_url:",
        product.image_url
    );

    console.log(
        "Final image URL:",
        imagePath
    );


    /* CREATE PRODUCT CARD */

    productCard.innerHTML = `

        <div class="product-image">

            <img
                src="${imagePath}"
                alt="${product.name}"
            >

        </div>


        <div class="product-content">

            <span class="product-category">
                ${product.category}
            </span>

            <h3>
                ${product.name}
            </h3>

            <p>
                ${product.description}
            </p>

            <a
                href="#contact"
                class="product-btn"
            >
                View Details
                <span>→</span>
            </a>

        </div>

    `;


    /* IMAGE ERROR CHECK */

    const productImage =
        productCard.querySelector("img");


    productImage.addEventListener(
        "error",
        function () {

            console.error(
                "IMAGE FAILED:",
                imagePath
            );

        }
    );


    productImage.addEventListener(
        "load",
        function () {

            console.log(
                "IMAGE LOADED SUCCESSFULLY:",
                imagePath
            );

        }
    );


    /* ADD CARD TO PAGE */

    productsGrid.appendChild(productCard);

});

        console.log(
            "Products loaded successfully:",
            data.products.length
        );

    }

    catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        productsGrid.innerHTML = `
            <p class="product-error">
                Unable to load products.
                Please try again later.
            </p>
        `;

    }

}


/* Start loading products */
loadProducts();


/* =========================================================
   CONTACT FORM
   ========================================================= */

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        const submitButton = contactForm.querySelector(
            'button[type="submit"]'
        );

        /* ---------------------------------------------------------
           VALIDATION
           --------------------------------------------------------- */

        if (
            name === "" ||
            email === "" ||
            subject === "" ||
            message === ""
        ) {

            formMessage.textContent =
                "Please fill in all fields.";

            formMessage.className =
                "form-message error";

            return;
        }

        /* ---------------------------------------------------------
           EMAIL VALIDATION
           --------------------------------------------------------- */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            formMessage.textContent =
                "Please enter a valid email address.";

            formMessage.className =
                "form-message error";

            return;
        }

        /* ---------------------------------------------------------
           DISABLE BUTTON WHILE SUBMITTING
           --------------------------------------------------------- */

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        formMessage.textContent =
            "Sending message...";

        formMessage.className =
            "form-message";

        /* ---------------------------------------------------------
           SEND DATA TO FASTAPI
           --------------------------------------------------------- */

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/contact`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message
                    })
                }
            );

            const data = await response.json();

            console.log("Contact API response:", data);

            /* -----------------------------------------------------
               HANDLE BACKEND ERROR
               ----------------------------------------------------- */

            if (!response.ok || data.status === "error") {

                throw new Error(
                    data.message ||
                    "Unable to submit the form."
                );
            }

            /* -----------------------------------------------------
               SUCCESS
               ----------------------------------------------------- */

            formMessage.textContent =
                "Thank you! Your message has been submitted successfully.";

            formMessage.className =
                "form-message success";

            contactForm.reset();

            submitButton.disabled = false;

            submitButton.textContent =
                "Send Message →";

        }

        /* ---------------------------------------------------------
           ERROR
           --------------------------------------------------------- */

        catch (error) {

            console.error(
                "Contact form error:",
                error
            );

            formMessage.textContent =
                "Unable to send your message. Please try again.";

            formMessage.className =
                "form-message error";

            submitButton.disabled = false;

            submitButton.textContent =
                "Send Message →";
        }

    });

}


/* 11. PRODUCT BUTTONS / SMOOTH CONTACT SCROLL */

document.addEventListener(
    "click",
    function (event) {

        const productButton =
            event.target.closest(".product-btn");


        if (!productButton) {
            return;
        }


        const contactSection =
            document.getElementById("contact");


        if (!contactSection) {
            return;
        }


        event.preventDefault();


        contactSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


/* 12. DEBUG INFORMATION */

console.log(
    "Perpetual Medtech JavaScript initialized."
);